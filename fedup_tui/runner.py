"""Installation orchestration for Fed-up.

Executes catalog items as explicit subprocess argument lists (no shell
interpolation), with per-item retries, failure isolation, cancellation and
structured logging.  All commands run in worker threads so the Textual event
loop is never blocked.
"""

from __future__ import annotations

import json
import logging
import os
import re
import shlex
import subprocess
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

# Total attempts per item for retryable failures (first try + two retries).
MAX_ATTEMPTS = 3
DEFAULT_TIMEOUT = 900  # seconds per command

# Exit codes / messages that will not improve by retrying.
_PERMANENT_PATTERNS = (
    re.compile(r"nothing to do", re.IGNORECASE),
    re.compile(r"error: no match", re.IGNORECASE),        # dnf5 repoquery/install miss
    re.compile(r"Unable to find a match", re.IGNORECASE),  # dnf4-style miss
    re.compile(r"package .* is already installed", re.IGNORECASE),
    re.compile(r"No such file or directory.*\.repo", re.IGNORECASE),
    re.compile(r"permission denied", re.IGNORECASE),
    re.compile(r"is required by", re.IGNORECASE),          # removal dependency lock
)

_SAFE_NAME = re.compile(r"^[A-Za-z0-9._+-]+$")


def _redact(text: str) -> str:
    """Redact obvious secrets from any captured output."""
    text = re.sub(r"(?i)(password|passwd|token|secret)[=\s]+\S+", r"\1=[REDACTED]", text)
    return text


@dataclass
class ItemResult:
    item_id: str
    label: str
    status: str = "pending"  # pending|running|success|skipped|failed|cancelled
    attempts: int = 0
    error: str = ""
    log_path: str = ""
    verified: bool = False

    def as_dict(self) -> dict:
        return {
            "item_id": self.item_id,
            "label": self.label,
            "status": self.status,
            "attempts": self.attempts,
            "error": self.error,
            "log_path": self.log_path,
            "verified": self.verified,
        }


@dataclass
class RunReport:
    results: list[ItemResult] = field(default_factory=list)

    @property
    def succeeded(self):
        return [r for r in self.results if r.status == "success"]

    @property
    def skipped(self):
        return [r for r in self.results if r.status == "skipped"]

    @property
    def failed(self):
        return [r for r in self.results if r.status == "failed"]

    @property
    def cancelled(self):
        return [r for r in self.results if r.status == "cancelled"]


class InstallRunner:
    """Runs selected catalog items sequentially with retry + isolation."""

    def __init__(self, log_dir: Path | None = None, on_event: Callable[[str, ItemResult], None] | None = None):
        self.log_dir = Path(log_dir) if log_dir else Path(os.environ.get("FEDUP_LOG_DIR", Path.home() / ".local" / "share" / "fed-up" / "logs"))
        self.on_event = on_event or (lambda phase, result: None)
        self._cancel = threading.Event()
        self._proc_lock = threading.Lock()
        self._current_proc: subprocess.Popen | None = None
        self.logger = logging.getLogger("fedup.runner")
        os.makedirs(self.log_dir, exist_ok=True)

    # -- cancellation -----------------------------------------------------
    def cancel(self) -> None:
        """Request cancellation; kills any running subprocess."""
        self._cancel.set()
        with self._proc_lock:
            proc = self._current_proc
        if proc is not None:
            try:
                proc.terminate()
            except OSError:
                pass

    @property
    def cancelled(self) -> bool:
        return self._cancel.is_set()

    # -- command building -------------------------------------------------
    @staticmethod
    def build_argv(item: dict, assume_yes: bool = True) -> list[list[str]]:
        """Convert an item command string into explicit argv lists.

        Only simple `cmd && cmd` chains are split; each segment is parsed
        with shlex (POSIX mode) and sudo tokens are replaced with
        non-interactive `sudo -n`.  Raises ValueError on unparseable input.
        """
        command = item.get("command", "")
        segments: list[list[str]] = []
        for part in InstallRunner._split_chain(command):
            part = part.strip()
            if not part:
                continue
            try:
                argv = shlex.split(part, comments=False, posix=True)
            except ValueError as exc:
                raise ValueError(f"cannot parse command for {item.get('id')}: {exc}") from exc
            if not argv:
                continue
            argv = InstallRunner._sanitize_argv(argv, assume_yes=assume_yes)
            if argv:
                segments.append(argv)
        if not segments:
            raise ValueError(f"item {item.get('id')} has no executable command")
        return segments

    @staticmethod
    def _split_chain(command: str) -> list[str]:
        # Split only on top-level "&&" (config uses simple chains).
        parts, depth, buf, i = [], 0, [], 0
        quote = ""
        while i < len(command):
            ch = command[i]
            if quote:
                buf.append(ch)
                if ch == quote:
                    quote = ""
                elif ch == "\\" and quote == '"':
                    buf.append(command[i + 1] if i + 1 < len(command) else "")
                    i += 1
            elif ch in ("'", '"'):
                quote = ch
                buf.append(ch)
            elif ch in "([":
                depth += 1
                buf.append(ch)
            elif ch in ")]":
                depth -= 1
                buf.append(ch)
            elif depth == 0 and command.startswith("&&", i):
                parts.append("".join(buf))
                buf = []
                i += 2
                continue
            else:
                buf.append(ch)
            i += 1
        parts.append("".join(buf))
        return parts

    @staticmethod
    def _sanitize_argv(argv: list[str], assume_yes: bool) -> list[str]:
        out: list[str] = []
        idx = 0
        while idx < len(argv):
            tok = argv[idx]
            if tok == "sudo":
                nxt = argv[idx + 1] if idx + 1 < len(argv) else ""
                if nxt == "-E":
                    idx += 2
                    continue
                out.append("sudo")
                out.append("-n")
                idx += 1
                continue
            if assume_yes and tok in ("-y", "--yes") and out and "dnf" in out[0]:
                out[-1:] = ["-y"]  # keep single -y
                idx += 1
                continue
            out.append(tok)
            idx += 1
        return out

    # -- verification -----------------------------------------------------
    @staticmethod
    def verify_item(item: dict) -> bool | None:
        """Verify an installation actually completed.

        Returns True (verified), False (not installed) or None (no check).
        """
        pkgs = [p for p in item.get("packages") or [] if _SAFE_NAME.match(p)]
        kind = item.get("kind", "rpm")
        if pkgs and kind in ("rpm", "repo", ""):
            argv = ["rpm", "-q", *pkgs]
            try:
                return subprocess.run(argv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60).returncode == 0
            except (OSError, subprocess.TimeoutExpired):
                return None
        if kind == "flatpak" or "flatpak install" in item.get("command", ""):
            m = re.search(r"flatpak install\s+(?:-y\s+)?(\S+)", item.get("command", ""))
            if m and _SAFE_NAME.match(m.group(1)):
                try:
                    return subprocess.run(["flatpak", "list", "--app", m.group(1)],
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60).returncode == 0
                except (OSError, subprocess.TimeoutExpired):
                    return None
        return None

    # -- classification ---------------------------------------------------
    @staticmethod
    def is_retryable(returncode: int, output: str) -> bool:
        if returncode == 0:
            return False
        if returncode in (126, 127):  # not executable / command missing
            return False
        if any(p.search(output) for p in _PERMANENT_PATTERNS):
            return False
        return True

    # -- execution --------------------------------------------------------
    def run_items(self, items: list[dict]) -> RunReport:
        report = RunReport()
        for item in items:
            result = ItemResult(item_id=item["id"], label=item.get("label", item["id"]))
            report.results.append(result)
            if self.cancelled:
                result.status = "cancelled"
                self.on_event("cancelled", result)
                continue
            self._run_one(item, result)
        return report

    def _emit(self, phase: str, result: ItemResult) -> None:
        try:
            self.on_event(phase, result)
        except Exception:  # UI callback must never crash the runner
            pass

    def _run_one(self, item: dict, result: ItemResult) -> None:
        log_path = self.log_dir / f"{result.item_id}.log"
        result.log_path = str(log_path)
        try:
            segments = self.build_argv(item)
        except ValueError as exc:
            result.status = "failed"
            result.attempts = 1
            result.error = _redact(str(exc))
            self._emit("failed", result)
            return

        # Skip if everything is already installed.
        verdict = self.verify_item(item)
        if verdict is True and item.get("kind", "rpm") == "rpm":
            result.status = "skipped"
            result.error = "already installed"
            result.verified = True
            self._emit("skipped", result)
            return

        self._emit("running", result)
        last_output = ""
        last_rc = 1
        for attempt in range(1, MAX_ATTEMPTS + 1):
            if self.cancelled:
                result.status = "cancelled"
                self._emit("cancelled", result)
                return
            result.attempts = attempt
            if attempt > 1:
                self._emit("retrying", result)
                time.sleep(min(2 * attempt, 5))
            rc, output = self._exec_segments(segments, log_path, append=attempt > 1)
            last_rc, last_output = rc, output
            if rc == 0:
                verdict = self.verify_item(item)
                if verdict is False:
                    last_output += "\ncommand exited 0 but verification failed (rpm -q)"
                    continue
                result.status = "success"
                result.verified = verdict is True
                self._emit("success", result)
                return
            if not self.is_retryable(rc, output):
                break
        if self.cancelled:
            result.status = "cancelled"
            self._emit("cancelled", result)
            return
        result.status = "failed"
        tail = _redact(last_output)[-800:]
        result.error = f"exit {last_rc}: {tail}".strip(": ")

        self._emit("failed", result)

    def _exec_segments(self, segments: list[list[str]], log_path: Path, append: bool) -> tuple[int, str]:
        chunks: list[str] = []
        mode = "a" if append else "w"
        try:
            with open(log_path, mode, encoding="utf-8") as log:
                for argv in segments:
                    if self.cancelled:
                        return 130, "cancelled"
                    log.write(f"$ {' '.join(argv)}\n")
                    log.flush()
                    try:
                        proc = subprocess.Popen(
                            argv,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT,
                            text=True,
                            stdin=subprocess.DEVNULL,
                            env={**os.environ, "LANG": "C.UTF-8"},
                        )
                    except (OSError, ValueError) as exc:
                        msg = f"could not execute {argv[0]!r}: {exc}"
                        log.write(msg + "\n")
                        return 127, msg
                    with self._proc_lock:
                        self._current_proc = proc
                    try:
                        out, _ = proc.communicate(timeout=DEFAULT_TIMEOUT)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        out, _ = proc.communicate()
                        log.write("TIMEOUT\n")
                        return 124, (out or "") + "\ntimed out"
                    finally:
                        with self._proc_lock:
                            self._current_proc = None
                    out = out or ""
                    chunks.append(out)
                    log.write(out)
                    log.flush()
                    if proc.returncode != 0:
                        return proc.returncode, "".join(chunks)
        except OSError as exc:
            self.logger.warning("log write failed: %s", exc)
        return 0, "".join(chunks)


def write_machine_report(report: RunReport, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "results": [r.as_dict() for r in report.results],
    }
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
