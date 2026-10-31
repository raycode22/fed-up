// Pure, DOM-free helpers for generating Fedora setup scripts.
// Usable from both the browser (web/app.js) and Node tests.

export function shellQuote(value) {
  if (value === null || value === undefined) return "''";
  const str = String(value);
  if (str === '') return "''";
  if (/^[A-Za-z0-9_./:=+-]+$/.test(str)) return str;
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

export function topoSort(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const selected = new Set(selectedIds);
  // expand dependencies transitively
  const expanded = new Set(selected);
  const queue = [...selected];
  while (queue.length) {
    const id = queue.shift();
    const item = byId.get(id);
    if (!item) continue;
    for (const dep of item.depends_on || []) {
      if (!expanded.has(dep)) {
        expanded.add(dep);
        queue.push(dep);
      }
    }
  }
  // Kahn's algorithm
  const inDeg = new Map();
  for (const id of expanded) {
    const deps = (byId.get(id)?.depends_on || []).filter((d) => expanded.has(d));
    inDeg.set(id, deps.length);
  }
  const adj = new Map();
  for (const id of expanded) adj.set(id, []);
  for (const id of expanded) {
    for (const dep of byId.get(id)?.depends_on || []) {
      if (expanded.has(dep)) adj.get(dep).push(id);
    }
  }
  const q = [...expanded].filter((id) => inDeg.get(id) === 0).sort();
  const order = [];
  while (q.length) {
    const id = q.shift();
    order.push(id);
    for (const n of (adj.get(id) || []).sort()) {
      inDeg.set(n, inDeg.get(n) - 1);
      if (inDeg.get(n) === 0) q.push(n);
      q.sort();
    }
  }
  if (order.length !== expanded.size) {
    throw new Error('Dependency cycle detected');
  }
  return order.map((id) => byId.get(id));
}

export function autoSelectDependencies(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const result = new Set(selectedIds);
  const queue = [...selectedIds];
  while (queue.length) {
    const id = queue.shift();
    const item = byId.get(id);
    if (!item) continue;
    for (const dep of item.depends_on || []) {
      if (!result.has(dep)) {
        result.add(dep);
        queue.push(dep);
      }
    }
  }
  return [...result];
}

export function hasConflict(items, a, b) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ia = byId.get(a);
  const ib = byId.get(b);
  if (!ia || !ib) return false;
  return (ia.conflicts_with || []).includes(b) || (ib.conflicts_with || []).includes(a);
}

export function filterBySystem(items, { fedora, desktop, arch } = {}) {
  return items.filter((item) => {
    const supported = item.supported_fedora || item.tested_fedora || [];
    if (fedora && supported.length && !supported.includes(String(fedora))) return false;
    if (desktop && item.desktops && item.desktops !== 'any' && item.desktops !== desktop) return false;
    if (arch && item.arch && item.arch !== 'any' && !(Array.isArray(item.arch) ? item.arch.includes(arch) : item.arch === arch)) return false;
    return true;
  });
}

export function isRecommended(item, desktop = 'any') {
  if (!item || item.status !== 'recommended') return false;
  const recommendedOn = Array.isArray(item.recommended_on)
    ? item.recommended_on
    : [item.desktops || 'any'];
  if (recommendedOn.length === 0) return true;
  return recommendedOn.includes('any') || recommendedOn.includes(desktop);
}

export function buildScript(items) {
  const lines = ['#!/usr/bin/env bash', 'set -u', ''];
  for (const item of items) {
    lines.push('# ' + item.id);
    lines.push(item.command);
  }
  return lines.join('\n') + '\n';
}

// --- Bootstrapper generation (browser side) --------------------------------
// Produces ONE self-contained, POSIX-compatible fed-up.sh that embeds:
//   * the full application catalog (only validated items),
//   * the user's selection,
//   * the complete Fed-up Python/Textual application source,
// and prepares its own isolated virtual environment with pinned
// dependencies before launching the TUI. No Git, no repo download,
// no website access after download. Mirrors build/bootstrap_template.py.

const ID_SAFE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function validateSelectedIds(ids) {
  return ids.filter((id) => ID_SAFE_RE.test(id));
}

function sanitizeItem(item) {
  // Embed only whitelisted fields with validated types; everything else
  // (unknown keys, injected values) is dropped. Commands are never
  // concatenated into shell code — they live inside the base64 payload
  // and are executed by the Python engine as argv lists.
  if (!item || typeof item.id !== 'string' || !ID_SAFE_RE.test(item.id)) {
    return null;
  }
  const strArray = (v) => (Array.isArray(v)
    ? v.filter((s) => typeof s === 'string' && /^[A-Za-z0-9@:._+-]{1,128}$/.test(s))
    : []);
  const out = {
    id: item.id,
    label: String(item.label || item.id).slice(0, 120),
    description: String(item.description || '').slice(0, 500),
    command: String(item.command || '').slice(0, 2000),
    requires_sudo: item.requires_sudo === true,
    tested_fedora: strArray(item.tested_fedora),
    supported_fedora: strArray(item.supported_fedora),
    desktops: ['any', 'gnome', 'kde'].includes(item.desktops) ? item.desktops : 'any',
    arch: typeof item.arch === 'string' || Array.isArray(item.arch) ? item.arch : 'any',
    recommended_on: strArray(item.recommended_on),
    kind: ['rpm', 'flatpak', 'repo', 'config', 'script'].includes(item.kind) ? item.kind : 'rpm',
    packages: strArray(item.packages),
    depends_on: strArray(item.depends_on),
    conflicts_with: strArray(item.conflicts_with),
    tags: strArray(item.tags),
    status: ['recommended', 'optional', 'caution', 'unsupported'].includes(item.status) ? item.status : 'optional',
    impact: ['low', 'medium', 'high'].includes(item.impact) ? item.impact : 'low',
    install_order: Number.isFinite(item.install_order) ? item.install_order : 1000,
  };
  if (typeof item.risk === 'string') out.risk = item.risk.slice(0, 300);
  if (typeof item.verbose_description === 'string') out.verbose_description = item.verbose_description.slice(0, 2000);
  if (typeof item.docs === 'string') out.docs = item.docs.slice(0, 300);
  return out;
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 = (typeof btoa === 'function')
    ? btoa(bin)
    : Buffer.from(bytes).toString('base64');
  return b64.match(/.{1,76}/g).join('\n');
}

// The complete Fed-up application, embedded verbatim into every generated
// script. Kept in sync with fedup_tui/ by tests (build/test_e2e.py).
const FEDUP_APP_PY = String.raw`#!/usr/bin/env python3
"""Fed-up — self-contained post-install setup engine for Fedora 43/44.

Runs from a temporary directory extracted by the POSIX bootstrapper.
No repository, network assets, or system Python modifications required.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pty
import re
import select
import shutil
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field

MIN_PY = (3, 10)
SUPPORTED_FEDORA = ("43", "44")
MAX_ATTEMPTS = 3          # retryable failures: at most 3 total attempts
ITEM_TIMEOUT = 900        # seconds per operation
CHUNK = 65536

_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._+-]*$")
_PKG_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._+-]*$")
_SECRET_RE = re.compile(
    r"(?i)((?:password|passwd|token|secret|api[_-]?key)\s*[=:]\s*)\S+")

PERMANENT_MARKERS = (
    "no match for argument", "nothing provides", "package .* is not installed",
    "unable to detect release version", "cannot find a valid baseurl",
    "problem confirming certificate", "status code: 404", "not found in tables",
    "conflicts with", "cannot install both",
)
RETRYABLE_MARKERS = (
    "check the subscription manager", "could not activate remote",
    "failed to synchronize cache for repo", "cannot prepare internal mirrorlist",
    "status code: 50", "connection reset", "connection refused",
    "temporary failure in name resolution", "couldn't resolve host",
    "ssl_error", "timed out", "timeout", "metadata-expire",
    "waiting for transaction lock", "locked",
)


def redact(text: str) -> str:
    return _SECRET_RE.sub(r"\1***", text or "")


class PermanentFailure(Exception):
    pass


class RetryableFailure(Exception):
    def __init__(self, message: str, output: str = ""):
        super().__init__(message)
        self.output = output


def classify_failure(output: str) -> bool:
    """Return True when the failure looks retryable (network/lock issues)."""
    low = output.lower()
    for pat in PERMANENT_MARKERS:
        if re.search(pat, low):
            return False
    return any(m in low for m in RETRYABLE_MARKERS)


# --------------------------------------------------------------------------- #
# Environment detection
# --------------------------------------------------------------------------- #
@dataclass
class Env:
    fedora: str = ""
    desktop: str = "any"
    arch: str = ""
    wayland: bool = True
    has_sudo: bool = False
    ok: bool = True
    problems: list = field(default_factory=list)

    @property
    def supported(self) -> bool:
        return self.fedora in SUPPORTED_FEDORA


def detect_environment() -> Env:
    env = Env()
    try:
        with open("/etc/os-release", encoding="utf-8") as fh:
            kv = dict(
                line.strip().split("=", 1)
                for line in fh if "=" in line)
        ver = kv.get("VERSION_ID", "").strip('"')
        env.fedora = ver.split(".")[0]
        if "fedora" not in kv.get("ID", "").lower() and \
           "fedora" not in kv.get("ID_LIKE", "").lower():
            env.problems.append(f"OS is not Fedora (ID={kv.get('ID', '?')}).")
    except OSError:
        env.problems.append("Cannot read /etc/os-release.")
    env.arch = os.uname().machine
    if env.fedora and env.fedora not in SUPPORTED_FEDORA:
        env.problems.append(
            f"Fedora {env.fedora} is not officially supported "
            f"(target: {'/'.join(SUPPORTED_FEDORA)}).")
    de = (os.environ.get("XDG_CURRENT_DESKTOP") or "").lower()
    env.desktop = "gnome" if "gnome" in de else \
                  "kde" if ("kde" in de or "plasma" in de) else "any"
    env.wayland = os.environ.get("WAYLAND_DISPLAY", "") != "" or \
        "wayland" in (os.environ.get("XDG_SESSION_TYPE") or "").lower()
    try:
        r = subprocess.run(["sudo", "-n", "true"], capture_output=True,
                           timeout=10)
        env.has_sudo = r.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        env.has_sudo = False
    return env


# --------------------------------------------------------------------------- #
# Command construction (validated argv lists only — never eval, never
# arbitrary string interpolation into a shell)
# --------------------------------------------------------------------------- #
def _pkgs(item: dict) -> list[str]:
    pkgs = item.get("packages") or []
    if not pkgs:
        m = re.search(r"(?:dnf5?\s+(?:install|-y install)\s+)(.+)$",
                      item.get("command", ""))
        if m:
            pkgs = [p for p in m.group(1).split()
                    if not p.startswith("-")]
    clean = [p for p in pkgs if isinstance(p, str) and _PKG_RE.match(p)]
    if len(clean) != len(pkgs):
        raise PermanentFailure(
            f"{item.get('id')}: package names failed validation")
    return clean


def build_argv(item: dict, env: Env) -> list[str]:
    """Map a validated catalog item to an explicit argv list."""
    iid = item["id"]
    if not _ID_RE.match(iid):
        raise PermanentFailure(f"invalid item id: {iid!r}")
    kind = item.get("kind", "rpm")
    sudo = ["sudo", "-n"] if item.get("requires_sudo") else []
    if item.get("requires_sudo") and env.fedora:
        sudo = ["sudo"]          # may prompt; run via PTY below
    if kind == "flatpak":
        apps = _pkgs(item)
        if not apps:
            raise PermanentFailure(f"{iid}: no flatpak app id given")
        return ["flatpak", "install", "--system", "--assumeyes"] + \
            [a for a in apps if ":" in a] or \
            ["flatpak", "install", "--system", "--assumeyes"] + apps
    if kind == "repo":
        cmd = item.get("command", "")
        m = re.match(r"^sudo\s+dnf\d?\s+install\s+-y\s+(\S+\.rpm)$", cmd)
        if not m:
            raise PermanentFailure(f"{iid}: repo item has unsupported form")
        url = m.group(1)
        if not re.match(r"^https://mirrors\.rpmfusion\.org/", url):
            raise PermanentFailure(f"{iid}: untrusted repo URL")
        rel = url.replace("$" + "{releasever}", env.fedora or "43")
        rel = rel.replace("$releasever", env.fedora or "43")
        if "$" in rel:
            raise PermanentFailure(f"{iid}: unresolved variable in URL")
        return ["sudo", "dnf5", "install", "-y", rel]
    if kind in ("rpm", "config"):
        pkgs = _pkgs(item)
        if pkgs:
            return sudo + ["dnf5", "install", "-y"] + pkgs
        cmd = item.get("command", "")
        m = re.match(r"^sudo\s+(systemctl\s+.+)$", cmd)
        if m:
            return ["sudo", "systemctl"] + m.group(1).split()[1:]
        m = re.match(r"^sudo\s+dnf\d?\s+config-manager\s+(?:--enablerepo=\S+\s+)?(disabl|enabl)e\s+(\S+)$", cmd)
        if m:
            return ["sudo", "dnf5", "config-manager",
                    m.group(1) + "e", m.group(2)]
        raise PermanentFailure(f"{iid}: cannot derive a safe command")
    if kind == "script":
        cmd = item.get("command", "")
        m = re.match(r"^curl\s+-fsSL\s+(\S+)\s*\|\s*(?:sudo\s+)?(bash|sh)$",
                     cmd)
        if not m:
            raise PermanentFailure(f"{iid}: remote-script item rejected")
        url = m.group(1)
        if not url.startswith("https://"):
            raise PermanentFailure(f"{iid}: remote script must be https")
        fd, path = tempfile.mkstemp(prefix="fedup-dl-", suffix=".sh")
        os.close(fd)
        dl = subprocess.run(["curl", "-fsSL", "--max-time", "120",
                             "-o", path, url], capture_output=True, text=True)
        if dl.returncode != 0:
            os.unlink(path)
            out = redact(dl.stderr or dl.stdout)
            if classify_failure(out):
                raise RetryableFailure(f"{iid}: download failed", out)
            raise PermanentFailure(f"{iid}: download failed: {out[:300]}")
        return [m.group(2), path]


def verify_installed(item: dict, env: Env) -> None:
    """Never report success without checking completion."""
    kind = item.get("kind", "rpm")
    if kind in ("rpm", "repo"):
        pkgs = _pkgs(item)
        if pkgs:
            r = subprocess.run(["rpm", "-q"] + pkgs, capture_output=True,
                               text=True)
            if r.returncode != 0:
                raise RuntimeError(
                    f"post-check failed: {redact(r.stdout + r.stderr)[:300]}")
    elif kind == "flatpak":
        apps = _pkgs(item)
        r = subprocess.run(["flatpak", "list", "--app-id", "--system"],
                           capture_output=True, text=True)
        missing = [a for a in apps if a not in r.stdout]
        if missing:
            raise RuntimeError(f"flatpak still missing: {missing}")


# --------------------------------------------------------------------------- #
# Subprocess execution (non-blocking, timeout, cancellation, PTY for sudo)
# --------------------------------------------------------------------------- #
class Cancelled(Exception):
    pass


class Runner:
    def __init__(self, log_path: str):
        self.log_path = log_path
        self.cancelled = False
        self._log = open(log_path, "a", encoding="utf-8")

    def log(self, line: str) -> None:
        self._log.write(line.rstrip("\n") + "\n")
        self._log.flush()

    def close(self) -> None:
        try:
            self._log.close()
        except OSError:
            pass

    def run(self, argv: list[str], *, interactive_prompt: bool = False,
            timeout: int = ITEM_TIMEOUT, env_extra=None) -> tuple[int, str]:
        if self.cancelled:
            raise Cancelled("cancelled before start")
        self.log("$ " + " ".join(argv))
        child_env = dict(os.environ)
        child_env.update(env_extra or {})
        child_env.setdefault("LANG", "C.UTF-8")
        start = time.monotonic()
        if interactive_prompt:
            out = self._run_pty(argv, child_env, timeout)
        else:
            proc = subprocess.Popen(argv, stdout=subprocess.PIPE,
                                    stderr=subprocess.STDOUT, text=True,
                                    env=child_env)
            chunks = []
            for line in proc.stdout:
                if self.cancelled:
                    proc.terminate()
                    try:
                        proc.wait(5)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                    raise Cancelled("cancelled during run")
                chunks.append(line)
                if time.monotonic() - start > timeout:
                    proc.kill()
                    raise RetryableFailure("timeout", "".join(chunks))
            rc = proc.wait()
            out = "".join(chunks)
        self.log(redact(out)[-4000:])
        return rc, out

    def _run_pty(self, argv, child_env, timeout) -> str:
        master, slave = pty.openpty()
        proc = subprocess.Popen(argv, stdin=slave, stdout=slave,
                                stderr=slave, env=child_env, close_fds=True)
        os.close(slave)
        buf = bytearray()
        deadline = time.monotonic() + timeout
        while True:
            if self.cancelled:
                proc.terminate()
                os.close(master)
                raise Cancelled("cancelled during privileged op")
            r, _, _ = select.select([master], [], [], 0.2)
            if r:
                try:
                    data = os.read(master, CHUNK)
                except OSError:
                    break
                if not data:
                    break
                buf.extend(data)
            if proc.poll() is not None and not r:
                break
            if time.monotonic() > deadline:
                proc.kill()
                os.close(master)
                raise RetryableFailure("timeout", buf.decode(errors="replace"))
        try:
            os.close(master)
        except OSError:
            pass
        proc.wait()
        return buf.decode(errors="replace")


# --------------------------------------------------------------------------- #
# Catalog loading & selection
# --------------------------------------------------------------------------- #
def load_catalog(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except FileNotFoundError:
        sys.stderr.write(
            f"Error: configuration file '{path}' was not found.\n"
            "This installer is self-contained; the error usually means the\n"
            "embedded payload could not be extracted. Re-download fed-up.sh\n"
            "from the Fed-up website and run it again.\n")
        raise SystemExit(3)
    except json.JSONDecodeError as exc:
        sys.stderr.write(f"Error: corrupt embedded config: {exc}\n")
        raise SystemExit(3)
    if not isinstance(data, dict) or not isinstance(
            data.get("categories"), list):
        sys.stderr.write("Error: unexpected config structure.\n")
        raise SystemExit(3)
    return data


def all_items(catalog: dict) -> list[dict]:
    seen, out = set(), []
    for cat in catalog["categories"]:
        for it in cat.get("items", []):
            if isinstance(it, dict) and it.get("id") and \
                    _ID_RE.match(it["id"]) and it["id"] not in seen:
                seen.add(it["id"])
                out.append(it)
    return out


def expand_dependencies(items: list[dict], ids: list[str]) -> list[str]:
    by_id = {i["id"]: i for i in items}
    result, queue = list(dict.fromkeys(ids)), list(ids)
    while queue:
        for dep in by_id.get(queue.pop(), {}).get("depends_on", []):
            if dep in by_id and dep not in result:
                result.append(dep)
                queue.append(dep)
    return result


def install_order(items: list[dict], ids: list[str]) -> list[dict]:
    by_id = {i["id"]: i for i in items}
    sel = set(ids)
    indeg = {i: len([d for d in by_id[i].get("depends_on", [])
                     if d in sel]) for i in sel}
    ready = sorted([i for i in sel if indeg[i] == 0],
                   key=lambda i: (by_id[i].get("install_order", 1000), i))
    order: list[dict] = []
    done: set[str] = set()
    while ready:
        iid = ready.pop(0)
        done.add(iid)
        order.append(by_id[iid])
        newly = []
        for other in sel - done:
            if iid in by_id[other].get("depends_on", []):
                indeg[other] -= 1
                if indeg[other] == 0:
                    newly.append(other)
        if newly:
            ready = sorted(ready + newly,
                           key=lambda i: (by_id[i].get("install_order",
                                                       1000), i))
    if len(order) != len(sel):     # cycle safety valve
        order.extend(by_id[i] for i in sorted(sel - done))
    return order


DESKTOP_LABEL = {"gnome": "GNOME", "kde": "KDE PLASMA", "any": "GENERAL"}
RISK_LABEL = {"info": "INFO", "caution": "CAUTION", "warning": "WARNING"}


def risk_of(item: dict) -> str:
    if item.get("risk"):
        return item["risk"]
    kind = item.get("kind")
    if kind == "repo":
        return ("Adds a third-party (RPM Fusion) package repository. "
                "Packages come from outside Fedora's official repos.")
    if kind == "script":
        return ("Downloads and executes a maintenance script from the "
                "internet. Review it before running.")
    if item.get("requires_sudo"):
        return "Needs administrator (sudo) privileges."
    return ""


def verbose_text(item: dict) -> str:
    parts = [item.get("verbose_description") or item.get("description", "")]
    src = {"rpm": "DNF (Fedora package manager)",
           "repo": "third-party RPM repository",
           "flatpak": "Flathub via Flatpak",
           "config": "system configuration change",
           "script": "vendor-provided remote script"}.get(
        item.get("kind", "rpm"), item.get("kind", ""))
    parts.append(f"Source: {src}.")
    parts.append(f"Desktop compatibility: "
                 f"{DESKTOP_LABEL.get(item.get('desktops', 'any'))}.")
    deps = item.get("depends_on") or []
    if deps:
        parts.append("Prerequisites (installed automatically): "
                     + ", ".join(deps) + ".")
    if item.get("docs"):
        parts.append("Docs: " + item["docs"])
    if item.get("requires_sudo"):
        parts.append("This operation asks for your sudo password.")
    return " ".join(p for p in parts if p)


# --------------------------------------------------------------------------- #
# Engine
# --------------------------------------------------------------------------- #
@dataclass
class Result:
    item: dict
    state: str = "pending"   # pending/running/retrying/success/skipped/failed
    attempts: int = 0
    error: str = ""


class Engine:
    def __init__(self, plan: list[dict], env: Env, log_path: str):
        self.plan = plan
        self.env = env
        self.runner = Runner(log_path)
        self.results = [Result(i) for i in plan]

    def run_one(self, res: Result, emit) -> None:
        item = res.item
        if item.get("status") == "unsupported":
            res.state = "skipped"
            res.error = "Marked unsupported for Fedora " + self.env.fedora
            emit(res)
            return
        sup = item.get("supported_fedora") or item.get("tested_fedora") or []
        if self.env.fedora and sup and self.env.fedora not in sup:
            res.state = "skipped"
            res.error = (f"Not verified for Fedora {self.env.fedora} "
                         f"(tested: {', '.join(sup)})")
            emit(res)
            return
        des = item.get("desktops", "any")
        if des != "any" and self.env.desktop != "any" and des != self.env.desktop:
            res.state = "skipped"
            res.error = f"{DESKTOP_LABEL[des]}-specific on a " \
                        f"{DESKTOP_LABEL.get(self.env.desktop, 'different')} desktop"
            emit(res)
            return
        arch = item.get("arch", "any")
        if arch not in ("any", self.env.arch) and \
                not (isinstance(arch, list) and self.env.arch in arch):
            res.state = "skipped"
            res.error = f"Unsupported architecture ({self.env.arch})"
            emit(res)
            return
        if item.get("kind") == "flatpak" and \
                shutil.which("flatpak") is None:
            res.state = "failed"
            res.attempts = 1
            res.error = "flatpak is not installed; enable it first"
            emit(res)
            return
        privileged = bool(item.get("requires_sudo"))
        while res.attempts < MAX_ATTEMPTS:
            res.attempts += 1
            res.state = "running" if res.attempts == 1 else "retrying"
            emit(res)
            tmp = None
            try:
                argv = build_argv(item, self.env)
                if argv and argv[-1].startswith("/tmp/fedup-dl-"):
                    tmp = argv[-1]
                rc, out = self.runner.run(
                    argv, interactive_prompt=privileged)
                if rc != 0:
                    msg = redact(out)[-500:] or f"exit code {rc}"
                    if classify_failure(out):
                        raise RetryableFailure(
                            f"exit {rc}: {msg}", out)
                    raise PermanentFailure(f"exit {rc}: {msg}")
                verify_installed(item, self.env)
                res.state = "success"
                res.error = ""
                manifest_add(item)
                emit(res)
                return
            except PermanentFailure as exc:
                res.state = "failed"
                res.error = str(exc)
                emit(res)
                return
            except RetryableFailure as exc:
                res.error = str(exc)
                if res.attempts >= MAX_ATTEMPTS:
                    res.state = "failed"
                    emit(res)
                    return
                emit(res)
                time.sleep(min(2 * res.attempts, 6))
            except Cancelled as exc:
                res.state = "skipped"
                res.error = f"cancelled: {exc}"
                emit(res)
                return
            except Exception as exc:               # isolation guard
                res.state = "failed"
                res.error = f"unexpected: {redact(str(exc))[:300]}"
                emit(res)
                return
            finally:
                if tmp and os.path.exists(tmp):
                    os.unlink(tmp)

    def run_all(self, emit) -> None:
        for res in self.results:
            if self.runner.cancelled:
                res.state = "skipped"
                res.error = "installation cancelled by user"
                emit(res)
                continue
            self.run_one(res, emit)


def manifest_add(item: dict) -> None:
    """Track RPMs we installed so the revert script can offer removal."""
    if item.get("kind") not in ("rpm", "repo"):
        return
    try:
        pkgs = _pkgs(item)
    except PermanentFailure:
        return
    if not pkgs:
        return
    d = os.path.expanduser("~/.local/state/fed-up")
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, "installed-packages")
    existing = set()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            existing = {ln.strip() for ln in fh}
    with open(path, "w", encoding="utf-8") as fh:
        for p in sorted(existing | set(pkgs)):
            if _PKG_RE.match(p):
                fh.write(p + "\n")


def build_report(results: list[Result], log_path: str) -> str:
    lines = ["Fed-up installation report", "=" * 26]
    ok = [r for r in results if r.state == "success"]
    sk = [r for r in results if r.state == "skipped"]
    bad = [r for r in results if r.state == "failed"]
    lines.append(f"Successful: {len(ok)}  Skipped: {len(sk)}  "
                 f"Failed: {len(bad)}")
    for title, group in (("Success", ok), ("Skipped", sk), ("Failed", bad)):
        if not group:
            continue
        lines.append(f"\n{title}:")
        for r in group:
            extra = f" [{r.attempts} attempts]" if title == "Failed" else ""
            err = f" — {r.error}" if r.error else ""
            lines.append(f"  • {r.item['label']}{extra}{err}")
    if bad:
        lines.append("\nTip: for each failure, search the exact error text "
                     "together with 'Fedora ' plus your release number "
                     "(ask.fedoraproject.org or the upstream issue tracker) "
                     "to find the newest fix.")
        lines.append(f"Full diagnostic log: {log_path}")
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Textual TUI
# --------------------------------------------------------------------------- #
HEADER_TEXT = "⬆  F E D - U P"
SUBTITLE = "Post-install setup for Fedora 43 · 44"


def run_textual(catalog: dict, preselect: list[str], verbose: bool,
                yes: bool, env: Env, log_path: str) -> int:
    from textual.app import App, ComposeResult
    from textual.containers import Horizontal, Vertical, VerticalScroll
    from textual.widgets import (Button, Checkbox, Footer, Header,
                                 ListItem, ListView, RichLog, Static)
    from textual.reactive import reactive
    
    ITEMS = all_items(catalog)

    class Badge(Static):
        def __init__(self, text, cls, **kw):
            super().__init__(text, classes="badge " + cls, **kw)

    class ItemRow(ListItem):
        def __init__(self, item):
            self.item = item
            badges = [Badge(DESKTOP_LABEL.get(item.get("desktops", "any")),
                            "desk-" + item.get("desktops", "any"))]
            rk = risk_of(item)
            if rk:
                lvl = ("warning" if item.get("kind") in ("repo", "script")
                       or item.get("impact") == "high"
                       else "caution" if item.get("requires_sudo")
                       else "info")
                badges.append(Badge(RISK_LABEL[lvl], "risk-" + lvl))
            if item.get("status") == "unsupported":
                badges.append(Badge("UNSUPPORTED", "risk-warning"))
            super().__init__(
                Checkbox(f"{item['label']}  —  "
                         f"{item.get('description', '')[:90]}",
                         id=f"cb-{item['id']}"),
                Horizontal(*badges, classes="badges"),
                id=f"li-{item['id']}",
            )

    class FedUpApp(App):
        CSS = """
        Screen { layout: vertical; }
        #intro { padding: 1 2; }
        #intro Bold { text-style: bold; }
        .badge { padding: 0 1; margin-right: 1; border: round $border; }
        .desk-gnome { color: $accent; }
        .desk-kde { color: $success; }
        .desk-any { color: $text-muted; }
        .risk-info { color: $info; }
        .risk-caution { color: $warning; }
        .risk-warning { color: $error; }
        #detail { height: auto; max-height: 8; padding: 0 2;
                  color: $text-muted; }
        #progress-log { height: 1fr; }
        #status-bar { height: 1; background: $panel; padding: 0 1; }
        .state-success { color: $success; }
        .state-failed { color: $error; }
        .state-skipped { color: $warning; }
        .state-running { color: $accent; }
        .state-retrying { color: $warning; }
        ListView { height: 1fr; }
        """
        BINDINGS = [
            ("q", "quit_or_back", "Quit"),
            ("d", "toggle_dark", "Theme"),
            ("s", "start_install", "Start"),
        ]

        phase = reactive("intro")

        def compose(self) -> ComposeResult:
            yield Header(show_clock=False)
            with VerticalScroll(id="intro"):
                yield Static("", id="intro-body")
                yield Button("Review my selections →", id="go-review",
                             variant="primary")
            with Vertical(id="review", classes="hidden"):
                yield Static("Your selections (Space toggles, Enter shows "
                             "details):")
                yield ListView(*(ItemRow(i) for i in ITEMS), id="items")
                yield Static("", id="detail")
                with Horizontal():
                    yield Button("Install ✔", id="do-install",
                                 variant="success")
                    yield Button("Back", id="go-back")
            with Vertical(id="progress", classes="hidden"):
                yield Static("Installation progress:", id="status-bar")
                yield RichLog(id="progress-log", markup=True)
                yield Button("Finish", id="go-report", variant="primary")
            with VerticalScroll(id="report", classes="hidden"):
                yield Static("", id="report-body")
                yield Button("Quit", id="do-quit", variant="default")
            yield Footer()

        async def on_mount(self) -> None:
            notice = (
                f"[b]{HEADER_TEXT}[/b]  —  {SUBTITLE}\n\n"
                "Fed-up applies the setup options you chose on the website.\n\n"
                "[b]What it does:[/] installs packages via dnf5/flatpak and "
                "applies documented configuration changes.\n"
                "[b]Privileges:[/] uses sudo only for system changes; you "
                "may be asked for your password.\n"
                "[b]Network:[/] talks only to Fedora mirrors, RPM Fusion, "
                "Flathub and PyPI (already used to launch this app).\n"
                "[b]Privacy:[/] nothing about you is collected, stored or "
                "uploaded. A local log stays in ~/.local/state/fed-up/.\n"
                "[b]Review:[/] open the downloaded fed-up.sh in any text "
                "editor before running it.\n"
                "See README.md, SECURITY.md and the disclaimer on the "
                "website.\n")
            self.query_one("#intro-body", Static).update(notice)

        def on_button_pressed(self, event: Button.Pressed) -> None:
            bid = event.button.id
            if bid == "go-review":
                self.switch("review")
            elif bid == "go-back":
                self.switch("intro")
            elif bid == "do-install":
                self.run_worker(self._install(), thread=True,
                                exclusive=True, group="install")
                self.switch("progress")
            elif bid == "go-report":
                self.switch("report")
            elif bid == "do-quit":
                eng = ENGINE_HOLDER.get("engine")
                if eng:
                    eng.runner.cancelled = True
                    eng.runner.close()
                self.exit()

        def switch(self, screen_id: str) -> None:
            for sid in ("intro", "review", "progress", "report"):
                w = self.query_one(f"#{sid}")
                w.set_class(sid != screen_id, "hidden")

        async def action_quit_or_back(self) -> None:
            if self.phase != "intro":
                self.back()
            else:
                self.exit()

        def back(self) -> None:
            active = next(s for s in ("report", "progress", "review")
                          if not self.query_one(f"#{s}").has_class("hidden"))
            self.switch("intro" if active == "review" else
                        "review" if active == "progress" else "progress")

        def on_list_view_selected(self, event) -> None:
            item = getattr(event.item, "item", None)
            if not item:
                return
            txt = item.get("description", "")
            if verbose:
                txt = verbose_text(item)
            rk = risk_of(item)
            if rk:
                txt += f"\n[{RISK_LABEL.get('info')}]" if False else \
                    f"\nRisk note: {rk}"
            self.query_one("#detail", Static).update(txt)

        def collect_selected(self) -> list[dict]:
            ids = [cb.id[3:] for cb in self.query(Checkbox) if cb.value]
            ids = expand_dependencies(ITEMS, ids)
            return install_order(ITEMS, ids)

        async def action_start_install(self) -> None:
            self.switch("review")

        def _emit(self, res: Result) -> None:
            colors = {"success": "green", "failed": "red",
                      "skipped": "yellow", "running": "cyan",
                      "retrying": "yellow"}
            c = colors.get(res.state, "white")
            label = {"running": "Installing", "retrying":
                     f"Retry {res.attempts}/{MAX_ATTEMPTS}"}.get(
                res.state, res.state.capitalize())
            msg = f"[{c}]{label}:[/] {res.item['label']}"
            if res.error and res.state in ("failed", "skipped"):
                msg += f"  ({res.error[:120]})"
            self.call_from_thread(self._append_log, msg)

        def _append_log(self, msg: str) -> None:
            try:
                self.query_one("#progress-log", RichLog).write(msg)
            except Exception:
                pass

        def _install(self) -> None:
            plan = self.collect_selected_plan_from_thread()
            if not plan:
                self.call_from_thread(self._append_log,
                                      "Nothing selected — add items on the "
                                      "review screen first.")
                return
            engine = Engine(plan, ENV, LOG_PATH)
            ENGINE_HOLDER["engine"] = engine
            engine.run_all(self._emit)
            report = build_report(engine.results, LOG_PATH)
            self.call_from_thread(self._show_report, report, engine)

        def collect_selected_plan_from_thread(self):
            # called from worker thread: snapshot computed at start time
            return PLAN_HOLDER["plan"]

        def _show_report(self, report: str, engine: Engine) -> None:
            self.query_one("#report-body", Static).update(report)
            self.switch("report")


    ENV = env
    LOG_PATH = log_path
    ENGINE_HOLDER: dict = {}
    PLAN_HOLDER: dict = {"plan": []}

    app = FedUpApp()

    def seed() -> None:
        for cid in expand_dependencies(ITEMS, preselect):
            try:
                app.query_one(f"#cb-{cid}", Checkbox).value = True
            except Exception:
                pass
        PLAN_HOLDER["plan"] = app.collect_selected()
        if yes and PLAN_HOLDER["plan"]:
            app.switch("progress")
            app.run_worker(app._install(), thread=True, exclusive=True,
                           group="install")

    app.set_timer(0.1, seed)

    # Recompute plan whenever the user hits Install: wrap worker start.
    orig_pressed = FedUpApp.on_button_pressed

    def pressed(self, event):
        if event.button.id == "do-install":
            PLAN_HOLDER["plan"] = self.collect_selected()
        return orig_pressed(self, event)

    FedUpApp.on_button_pressed = pressed
    app.run()
    eng = ENGINE_HOLDER.get("engine")
    if eng and any(r.state == "failed" for r in eng.results):
        return 1
    return 0


# --------------------------------------------------------------------------- #
# Plain fallback (no TTY / Textual unavailable / FEDUP_NO_TUI=1)
# --------------------------------------------------------------------------- #
def run_plain(catalog: dict, preselect: list[str], env: Env,
              log_path: str) -> int:
    items = all_items(catalog)
    print(HEADER_TEXT + " — " + SUBTITLE)
    print("Interactive TUI unavailable; using plain prompts.")
    print("This tool installs the options you choose. Sudo may ask for "
          "your password. See SECURITY.md for privacy details.\n")
    chosen = preselect or []
    if not chosen:
        for n, it in enumerate(items, 1):
            tag = DESKTOP_LABEL.get(it.get("desktops", "any"))
            print(f"  {n}. [{tag}] {it['label']} — "
                  f"{it.get('description', '')[:60]}")
        print("  q. quit")
        raw = input("Enter numbers to install (e.g. 1 3 5): ").split()
        for tok in raw:
            if tok.lower() == "q":
                return 0
            if tok.isdigit() and 1 <= int(tok) <= len(items):
                chosen.append(items[int(tok) - 1]["id"])
        chosen = expand_dependencies(items, chosen)
    plan = install_order(items, chosen)
    if not plan:
        print("Nothing selected. Exiting.")
        return 0
    print("\nAbout to run:")
    for it in plan:
        rk = risk_of(it)
        print(f"  • {it['label']}" + (f"  ⚠ {rk}" if rk else ""))
    if input("Proceed? [y/N] ").strip().lower() not in ("y", "yes"):
        return 0
    engine = Engine(plan, env, log_path)

    def emit(res: Result) -> None:
        print(f"  [{res.state}] {res.item['label']}"
              + (f" ({res.error[:100]})" if res.error else ""))

    engine.run_all(emit)
    print("\n" + build_report(engine.results, log_path))
    return 1 if any(r.state == "failed" for r in engine.results) else 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="fed-up")
    parser.add_argument("--config", required=True)
    parser.add_argument("--items", nargs="*", default=[])
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--yes", action="store_true")
    ns = parser.parse_args(argv)

    if sys.version_info < MIN_PY:
        sys.stderr.write("Error: Python >= 3.10 required.\n")
        return 1
    catalog = load_catalog(ns.config)
    env = detect_environment()
    statedir = os.path.expanduser("~/.local/state/fed-up")
    os.makedirs(statedir, exist_ok=True)
    digest = hashlib.sha256(
        json.dumps(sorted(ns.items)).encode()).hexdigest()[:8]
    log_path = os.path.join(statedir,
                            f"install-{time.strftime('%Y%m%d-%H%M%S')}-{digest}.log")
    for p in env.problems:
        sys.stderr.write(f"Notice: {p}\n")

    use_tui = (sys.stdin.isatty() and sys.stdout.isatty()
               and os.environ.get("FEDUP_NO_TUI") != "1")
    if use_tui:
        try:
            import textual  # noqa: F401
            return run_textual(catalog, ns.items, ns.verbose, ns.yes,
                               env, log_path)
        except ImportError:
            sys.stderr.write("Textual unavailable — falling back to plain "
                             "mode.\n")
    return run_plain(catalog, ns.items, env, log_path)


if __name__ == "__main__":
    raise SystemExit(main())
`


export function buildBootstrapperScript(selectedItems, catalogMeta = {}, fullCatalogItems = []) {
  const requested = validateSelectedIds((selectedItems || []).map((i) => i.id));
  const byId = new Map();
  for (const raw of [...(fullCatalogItems || []), ...(selectedItems || [])]) {
    const it = sanitizeItem(raw);
    if (it) byId.set(it.id, it);
  }
  // expand dependencies against the trusted catalog
  const ids = [];
  const queue = [...requested];
  const seen = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    for (const dep of (byId.get(id) || {}).depends_on || []) {
      if (byId.has(dep) && !seen.has(dep)) queue.push(dep);
    }
  }
  ids.sort();
  const embeddedCatalog = {
    generated_at: catalogMeta.generated_at || 'static',
    source: 'fed-up web generator (browser-side)',
    selected: ids,
    categories: [{
      category: 'generated',
      label: 'Generated catalog',
      items: ids.map((id) => byId.get(id)),
    }],
  };
  const payloadFiles = {
    'data.json': JSON.stringify(embeddedCatalog, null, 2),
    'fedup_app.py': FEDUP_APP_PY,
  };
  const payloadB64 = b64encode(JSON.stringify(payloadFiles));
  const hashSeed = `${payloadB64.length}:${ids.join(',')}`;

  const lines = [
    '#!/usr/bin/env sh',
    '# Fed-up — self-contained post-install setup for Fedora 43/44',
    '# Generated entirely in your browser. One file: no Git, no downloads',
    '# of project files, no manual Python steps. Works under Bash, Zsh,',
    '# dash and plain sh. Review this script before running it.',
    'set -eu',
    '',
    'FEDUP_VERSION="3.0.0"',
    `PAYLOAD_HASH='${hashSeed}'`,
    'TEXTUAL_PIN="1.0.0"',
    'SELECTED_IDS=\' ' + ids.join(' ') + '\'',
    '',
    'echo "Fed-up bootstrapper v${FEDUP_VERSION}"',
    '',
    'err() { echo "Error: $*" >&2; }',
    '',
    '# --- locate a compatible Python interpreter ------------------------------',
    'PY=""',
    'for candidate in python3 python; do',
    '  if command -v "$candidate" >/dev/null 2>&1;',
    '  then',
    '    if "$candidate" -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" 2>/dev/null;',
    '    then',
    '      PY="$(command -v "$candidate")"',
    '      break',
    '    fi',
    '  fi',
    'done',
    'if [ -z "$PY" ]; then',
    '  err "Python >= 3.10 is required but was not found."',
    '  err "Fedora 43/44 ship it; try: sudo dnf5 install -y python3"',
    '  exit 1',
    'fi',
    '',
    '# --- arguments ------------------------------------------------------------',
    'SET_X=""',
    'SET_V=""',
    'for a in "$@"; do',
    '  case "$a" in',
    '    --yes) SET_X="--yes" ;;',
    '    --verbose|-v) SET_V="--verbose" ;;',
    '    --help|-h)',
    '      echo "Usage: $0 [--yes] [--verbose]"',
    '      echo "  Prepares an isolated Python environment, installs the"',
    '      echo "  pinned dependencies (Textual), verifies them, then starts"',
    '      echo "  the interactive Fed-up installer with your selections."',
    '      exit 0 ;;',
    '    *) err "Unknown option: $a"; exit 2 ;;',
    '  esac',
    'done',
    '',
    '# --- virtual environment (PEP 668 friendly, never touches system Python) -',
    'VENV="${FEDUP_VENV_DIR:-$HOME/.local/share/fed-up/venv}"',
    'STAMP_OK="$VENV/.fedup-deps-ok"',
    '',
    'need_venv() {',
    '  [ ! -x "$VENV/bin/python" ] && return 0',
    '  [ ! -f "$STAMP_OK" ] && return 0',
    '  [ "$(cat "$STAMP_OK" 2>/dev/null)" != "$PAYLOAD_HASH" ] && return 0',
    '  return 1',
    '}',
    '',
    'install_deps() {',
    '  vp="$1"',
    '  if ! "$vp" -m ensurepip --upgrade >/dev/null 2>&1; then',
    '    err "The python3 venv/ensurepip components are missing;"',
    '    err "attempting to install them via DNF (sudo required) ..."',
    '    if command -v sudo >/dev/null 2>&1 && command -v dnf5 >/dev/null 2>&1;',
    '    then',
    '      sudo dnf5 install -y python3-virtualenv || return 1',
    '    else',
    '      return 1',
    '    fi',
    '  fi',
    '  if ! "$vp" -m pip install --disable-pip-version-check --quiet "',
    '       "textual==$TEXTUAL_PIN"; then',
    '    return 1',
    '  fi',
    '  "$vp" -c "import textual" >/dev/null 2>&1 || return 1',
    '  return 0',
    '}',
    '',
    'if need_venv; then',
    '  echo "Preparing isolated Python environment at $VENV ..."',
    '  rm -rf "${VENV}.new"',
    '  if ! mkdir -p "${VENV%/*}"; then',
    '    err "Cannot create $VENV"; exit 1',
    '  fi',
    '  if ! "$PY" -m venv "${VENV}.new" >/dev/null 2>&1; then',
    '    err "Could not create a virtual environment."',
    '    err "Try: sudo dnf5 install -y python3-virtualenv"',
    '    exit 1',
    '  fi',
    '  if ! install_deps "${VENV}.new/bin/python"; then',
    '    err "Dependency preparation failed (network or repository problem)."',
    '    err "The previous environment was left untouched."',
    '    rm -rf "${VENV}.new"',
    '    exit 1',
    '  fi',
    '  rm -rf "$VENV"',
    '  mv "${VENV}.new" "$VENV"',
    '  printf "%s\\n" "$PAYLOAD_HASH" > "$STAMP_OK"',
    'elif ! "$VENV/bin/python" -c "import textual" >/dev/null 2>&1; then',
    '  echo "Existing environment is incomplete; repairing ..."',
    '  rm -f "$STAMP_OK"',
    '  if ! install_deps "$VENV/bin/python"; then',
    '    err "Repair failed. Remove $VENV and rerun this script."',
    '    exit 1',
    '  fi',
    '  printf "%s\\n" "$PAYLOAD_HASH" > "$STAMP_OK"',
    'fi',
    'VENV_PY="$VENV/bin/python"',
    '',
    '# --- extract embedded application (secure temp dir, cleaned on exit) -----',
    'TMPD="$(mktemp -d "${TMPDIR:-/tmp}/fed-up.XXXXXX")"',
    'chmod 700 "$TMPD"',
    'cleanup() { rm -rf "$TMPD"; }',
    'trap cleanup EXIT',
    'trap "cleanup; trap - EXIT; kill -INT $$" INT',
    'trap "cleanup; trap - EXIT; kill -TERM $$" TERM',
    '',
    'cat > "$TMPD/payload.b64" <<\'FEDUP_PAYLOAD_EOF\'',
    payloadB64,
    'FEDUP_PAYLOAD_EOF',
    '',
    'if ! "$VENV_PY" - "$TMPD" <<\'FEDUP_EXTRACT_EOF\'',
    'import base64, json, pathlib, sys',
    'dest = pathlib.Path(sys.argv[1])',
    'files = json.loads(base64.b64decode((dest / "payload.b64").read_bytes()))',
    'for rel, content in files.items():',
    '    p = dest / rel',
    '    p.parent.mkdir(parents=True, exist_ok=True)',
    '    p.write_text(content, encoding="utf-8")',
    'FEDUP_EXTRACT_EOF',
    'then',
    '  err "Failed to unpack the embedded Fed-up application."',
    '  exit 1',
    'fi',
    'rm -f "$TMPD/payload.b64"',
    '',
    '# --- launch -----------------------------------------------------------------',
    '# With a TTY: the polished Textual TUI. Without one (or if Textual',
    '# cannot load): a clear numbered plain-text fallback.',
    'cd "$TMPD"',
    'if [ -n "$SET_X" ]; then',
    '  "$VENV_PY" fedup_app.py --config "$TMPD/data.json" $SET_V \\',
    '       --yes --items $SELECTED_IDS',
    '  exit $?',
    'fi',
    'exec "$VENV_PY" fedup_app.py --config "$TMPD/data.json" $SET_V',
  ];
  return lines.join('\n') + '\n';
}

// Backwards-compatible helper: expose the embedded app source for tests.
export const FEDUP_APP_SOURCE = FEDUP_APP_PY;