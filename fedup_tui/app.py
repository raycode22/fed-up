"""Fed-up Textual application.

A polished terminal UI for selecting and installing Fedora 43/44 setup
items.  Presentation (this module) is separated from installation
orchestration (`runner.py`) and catalog metadata (`catalog.py`).

Keyboard model (established Fed-up numbered options preserved):
    1  guided, quiet output      2  guided, verbose output
    3  install all now           q  quit / cancel
"""

from __future__ import annotations

import sys
from pathlib import Path

from textual import work
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.screen import ModalScreen, Screen
from textual.widgets import (
    Button,
    Checkbox,
    Footer,
    Header,
    Label,
    Markdown,
    ProgressBar,
    RichLog,
    Static,
)

from . import __version__
from .catalog import (
    detect_desktop,
    fedora_ok,
    load_catalog,
    risk_explanation,
    risk_tag,
    desktop_tag,
    verbose_text,
)
from .runner import InstallRunner, ItemResult, RunReport, write_machine_report

STATUS_SYMBOLS = {
    "pending": ("…", "grey"),
    "running": ("▶", "cyan"),
    "success": ("✓", "green"),
    "skipped": ("–", "yellow"),
    "failed": ("✗", "red"),
    "retrying": ("↻", "magenta"),
    "cancelled": ("⊘", "grey"),
}

PRIVACY_NOTICE = """\
# Fed-up · Privacy & Safety Notice

**What Fed-up does.** Fed-up is a *client-side* installer front-end for Fedora 43/44.
The website only generates this script in your browser; nothing is sent to any server.
This terminal application then runs the exact commands listed under each item.

**Technologies.** Python 3 + Textual (TUI), DNF5, rpm, flatpak — running inside a
private virtual environment created by `install.sh`. Nothing is forced into system Python.

**System modifications.** Package installs, repository files under `/etc/yum.repos.d`,
enabling systemd services/timers, and logs in `~/.local/share/fed-up`. Items that change
more than packages are labelled CAUTION/WARNING.

**Elevated privileges.** Items marked with sudo use `sudo -n` after you authenticate via
`sudo -v` (guided mode prompts per item). Read-only checks (`rpm -q`) never elevate.

**Network access.** Only to package mirrors, RPM Fusion, Flathub or upstream project
sites for items you explicitly selected. Fed-up itself contacts no telemetry endpoint.

**Your data.** Fed-up collects, stores or transmits **no personal information**.
Logs stay on your machine under `~/.local/share/fed-up/logs`.

**Review before running.** Every command is visible here (toggle verbose with `v`) and in
the generated script you downloaded — re-open it in any text editor before running.

Documentation: README.md, SECURITY.md and docs/TROUBLESHOOTING.md in the repository.

Press **Enter** to continue, or **q** to quit.\
"""


class NoticeScreen(ModalScreen[bool]):
    """Startup privacy/safety notice."""

    BINDINGS = [
        Binding("enter", "accept", "Continue", priority=True),
        Binding("space", "accept", "Continue", priority=True),
        Binding("q", "decline", "Quit"),
    ]

    def compose(self) -> ComposeResult:
        with Vertical(id="notice"):
            yield Markdown(PRIVACY_NOTICE, id="notice-body")
            with Horizontal():
                yield Button("Continue", variant="primary", id="btn-continue")
                yield Button("Quit", id="btn-decline")

    def action_accept(self) -> None:
        self.dismiss(True)

    def action_decline(self) -> None:
        self.app.exit()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-continue":
            self.action_accept()
        else:
            self.action_decline()


def _item_row(item: dict) -> str:
    tag = desktop_tag(item)
    risk = risk_tag(item)
    marks = []
    if tag != "GENERAL":
        marks.append(tag)
    if risk != "INFO":
        marks.append(risk)
    if not fedora_ok(item):
        marks.append("UNVERIFIED")
    suffix = f" [{' · '.join(marks)}]" if marks else ""
    star = "★ " if item.get("status") == "recommended" else ""
    return f"{star}{item.get('label', item['id'])}{suffix}"


def _short_text(item: dict) -> str:
    lines = [f"### {item.get('label', item['id'])}", "", item.get("description", "")]
    expl = risk_explanation(item)
    if expl:
        lines += ["", f"**{risk_tag(item)}:** {expl}"]
    lines += ["", f"Command: `{item.get('command','')}`"]
    if item.get("requires_sudo"):
        lines.append("_(needs sudo)_")
    return "\n".join(lines)


class ReviewScreen(Screen):
    """Category-grouped selection with per-item detail preview."""

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("r", "recommended", "Recommended"),
        Binding("a", "all", "All"),
        Binding("c", "clear", "Clear"),
        Binding("v", "verbose", "Verbose"),
        Binding("enter", "start", "Install", show=False),
    ]

    CSS = """
    #review-title { padding: 0 1; text-style: bold; }
    #filter-bar { height: auto; padding: 0 1; }
    #category-area { height: 1fr; }
    #categories { width: 3fr; border: round $primary; padding: 0 1; overflow-y: auto; }
    #detail { width: 2fr; border: round $secondary; padding: 0 1; }
    #bottom-bar { height: auto; padding: 0 1; }
    """

    def __init__(self, items: list[dict], verbose: bool = False):
        super().__init__()
        self.items = items
        self.verbose = verbose
        self.selected: set[str] = {i["id"] for i in items if i.get("status") == "recommended"}

    def compose(self) -> ComposeResult:
        yield Header(show_clock=False)
        yield Static(
            f"Fed-up v{__version__} · Space toggles an item · Enter installs · v verbose · r/a/c bulk select",
            id="review-title",
        )
        with Horizontal(id="filter-bar"):
            yield Label(f"Detected desktop: {desktop_tag({'desktops': detect_desktop()})}")
            yield Label("   ★ = recommended")
        with Horizontal(id="category-area"):
            with VerticalScroll(id="categories"):
                by_cat: dict[str, list[dict]] = {}
                for it in self.items:
                    by_cat.setdefault(it.get("category_label", "Other"), []).append(it)
                for cat_label, cat_items in by_cat.items():
                    yield Static(f"[b]{cat_label}[/b]", classes="cat-head")
                    for it in cat_items:
                        cb = Checkbox(_item_row(it), id=f"chk-{it['id']}")
                        cb.value = it["id"] in self.selected
                        yield cb
            with VerticalScroll(id="detail"):
                yield Markdown("", id="detail-md")
        with Horizontal(id="bottom-bar"):
            yield Button("Recommended", id="btn-rec")
            yield Button("All", id="btn-all")
            yield Button("None", id="btn-none")
            yield Button("Install selected", variant="primary", id="btn-go")
        yield Footer()

    # -- interactions -----------------------------------------------------
    def on_mount(self) -> None:
        if self.items:
            self._show_item(self.items[0]["id"])
        self._refresh_counts()

    def on_checkbox_changed(self, event: Checkbox.Changed) -> None:
        assert event.checkbox.id is not None
        item_id = event.checkbox.id.removeprefix("chk-")
        if event.value:
            self.selected.add(item_id)
            self._expand_dependencies(item_id)
        else:
            self.selected.discard(item_id)
        self._show_item(item_id)
        self._refresh_counts()

    def _expand_dependencies(self, item_id: str) -> None:
        by_id = {i["id"]: i for i in self.items}
        stack = [item_id]
        while stack:
            cur = stack.pop()
            for dep in by_id.get(cur, {}).get("depends_on", []):
                if dep in by_id and dep not in self.selected:
                    self.selected.add(dep)
                    try:
                        self.query_one(f"#chk-{dep}", Checkbox).value = True
                    except Exception:
                        pass
                    stack.append(dep)

    def _show_item(self, item_id: str) -> None:
        item = next((i for i in self.items if i["id"] == item_id), None)
        md = self.query_one("#detail-md", Markdown)
        if not item:
            md.update("")
            return
        md.update(verbose_text(item) if self.verbose else _short_text(item))

    def _selected_items(self) -> list[dict]:
        chosen = [i for i in self.items if i["id"] in self.selected]
        chosen.sort(key=lambda i: i.get("install_order", 0))
        return chosen

    def _set_all(self, ids: set[str]) -> None:
        self.selected = set(ids)
        for it in self.items:
            try:
                self.query_one(f"#chk-{it['id']}", Checkbox).value = it["id"] in ids
            except Exception:
                pass
        self._refresh_counts()

    def action_recommended(self) -> None:
        self._set_all({i["id"] for i in self.items if i.get("status") == "recommended"})

    def action_all(self) -> None:
        self._set_all({i["id"] for i in self.items})

    def action_clear(self) -> None:
        self._set_all(set())

    def action_verbose(self) -> None:
        self.verbose = not self.verbose
        first = next(iter(sorted(self.selected)), self.items[0]["id"] if self.items else "")
        self._show_item(first)
        self.notify(f"Verbose {'on' if self.verbose else 'off'}")

    def action_start(self) -> None:
        chosen = self._selected_items()
        if not chosen:
            self.notify("Nothing selected.", severity="warning")
            return
        app: FedUpApp = self.app  # type: ignore[assignment]

        def started(mode: str | None) -> None:
            if mode is None:
                return
            runner = InstallRunner(log_dir=app.log_dir)
            app.runner = runner
            screen = ProgressScreen(chosen, mode, self.verbose, runner)
            runner.on_event = screen.handle_event
            app.push_screen(screen)

        app.push_screen(ConfirmScreen(chosen), started)

    def action_quit(self) -> None:
        self.app.exit()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        mapping = {"btn-rec": self.action_recommended, "btn-all": self.action_all,
                   "btn-none": self.action_clear, "btn-go": self.action_start}
        handler = mapping.get(event.button.id)
        if handler:
            handler()

    def _refresh_counts(self) -> None:
        self.title = f"Select ({len(self.selected)}/{len(self.items)})"


class ConfirmScreen(ModalScreen[str | None]):
    """Final review + mode choice. Preserves numbered options 1/2/3/q."""

    BINDINGS = [
        Binding("1", "mode_guided_quiet", "1 Guided quiet", show=True),
        Binding("2", "mode_guided_verbose", "2 Guided verbose", show=True),
        Binding("3", "mode_all", "3 Install all", show=True),
        Binding("q", "cancel", "Cancel", show=True),
    ]

    def __init__(self, items: list[dict]):
        super().__init__()
        self.items = items

    def compose(self) -> ComposeResult:
        listing = "\n".join(f" • {_item_row(i)}" for i in self.items)
        risky = [i for i in self.items if risk_tag(i) != "INFO"]
        risk_txt = "\n".join(
            f" ! {i.get('label')} — {risk_explanation(i) or risk_tag(i)}" for i in risky
        )
        body = (
            f"# Review selections\n\nAbout to run **{len(self.items)}** item(s):\n\n{listing}\n\n"
            + (f"### Labeled operations\n{risk_txt}\n\n" if risky else "")
            + "Choose how to run them:\n\n"
              "| key | mode |\n|---|---|\n"
              "| 1 | Guided, quiet output — confirm each item; details only on errors |\n"
              "| 2 | Guided, verbose output — confirm each item; show command output |\n"
              "| 3 | Install all now — no further prompts (needs active sudo) |\n"
              "| q | Cancel |\n"
        )
        with Vertical(id="confirm"):
            yield Markdown(body, id="confirm-body")
            with Horizontal():
                yield Button("1 Guided quiet", id="b1")
                yield Button("2 Guided verbose", id="b2")
                yield Button("3 Install all", variant="primary", id="b3")
                yield Button("Cancel", id="bq")

    def _dismiss(self, mode: str | None) -> None:
        self.dismiss(mode)

    def action_mode_guided_quiet(self) -> None:
        self._dismiss("guided-quiet")

    def action_mode_guided_verbose(self) -> None:
        self._dismiss("guided-verbose")

    def action_mode_all(self) -> None:
        self._dismiss("all")

    def action_cancel(self) -> None:
        self._dismiss(None)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        mapping = {"b1": "guided-quiet", "b2": "guided-verbose", "b3": "all", "bq": None}
        self._dismiss(mapping.get(event.button.id))


class ProgressScreen(Screen):
    """Live progress with per-item status, retry counts and diagnostics."""

    BINDINGS = [Binding("q", "cancel_run", "Cancel")]

    CSS = """
    #prog-list { height: 1fr; border: round $primary; padding: 0 1; }
    #log-view { height: 9; border: round $secondary; }
    #bar { height: 1; padding: 0 1; }
    #prog-title { padding: 0 1; text-style: bold; }
    """

    def __init__(self, items: list[dict], mode: str, verbose: bool, runner: InstallRunner):
        super().__init__()
        self.items = items
        self.mode = mode
        self.verbose = verbose
        self.runner = runner
        self.report = RunReport()
        self._done = 0

    def compose(self) -> ComposeResult:
        yield Header()
        yield Static(
            f"Installing {len(self.items)} item(s) · mode: {self.mode} · press q to cancel",
            id="prog-title",
        )
        yield ProgressBar(total=len(self.items), id="bar", show_eta=False)
        with VerticalScroll(id="prog-list"):
            for it in self.items:
                sym, _ = STATUS_SYMBOLS["pending"]
                yield Static(f"{sym} {it.get('label', it['id'])}", id=f"st-{it['id']}", classes="status-line")
        yield RichLog(id="log-view", markup=True, wrap=True, highlight=True)
        yield Footer()

    def on_mount(self) -> None:
        self._install_all()

    @work(thread=True, exclusive=True)
    def _install_all(self) -> None:
        from textual.worker import get_current_worker

        worker = get_current_worker()
        report = self.runner.run_items(self.items)
        if not worker.cancelled:
            self.app.call_from_thread(self.finish, report)

    def handle_event(self, phase: str, result: ItemResult) -> None:
        """Thread-safe callback invoked by the runner (worker thread)."""
        try:
            self.app.call_from_thread(self.update_line, phase, result)
        except Exception:
            pass  # app shutting down; drop UI update

    def update_line(self, phase: str, result: ItemResult) -> None:
        try:
            line = self.query_one(f"#st-{result.item_id}", Static)
        except Exception:
            return
        sym, colour = STATUS_SYMBOLS.get(phase, ("?", "white"))
        extra = f" (attempt {result.attempts}/3)" if phase in ("retrying", "failed") and result.attempts > 1 else ""
        line.update(f"[{colour}]{sym}[/] {result.label}{extra}")
        log = self.query_one("#log-view", RichLog)
        msg = f"[{colour}]{phase:>9}[/] {result.label}"
        if result.error and phase in ("failed", "skipped"):
            msg += f" — {result.error[:160]}"
        log.write(msg)
        if phase in ("success", "skipped", "failed", "cancelled"):
            self._done += 1
            self.query_one("#bar", ProgressBar).update(progress=self._done)

    def finish(self, report: RunReport) -> None:
        self.report = report
        write_machine_report(report, Path(self.runner.log_dir).parent / "report.json")
        self.app.push_screen(ReportScreen(report, Path(self.runner.log_dir)))

    def action_cancel_run(self) -> None:
        self.runner.cancel()
        self.notify("Cancelling after current step…", severity="warning")


class ReportScreen(Screen):
    """Consolidated final report."""

    BINDINGS = [Binding("q", "quit", "Quit"), Binding("enter", "quit", "Done")]

    def __init__(self, report: RunReport, log_dir: Path):
        super().__init__()
        self.report = report
        self.log_dir = log_dir

    def compose(self) -> ComposeResult:
        yield Header()
        yield Static("Installation report", id="rep-title")
        with VerticalScroll(id="rep-body"):
            yield Markdown(self.render_markdown(), id="rep-md")
        yield Footer()

    def render_markdown(self) -> str:
        r = self.report
        parts = [
            "## Summary\n\n"
            f"- ✓ Success: **{len(r.succeeded)}**\n"
            f"- – Skipped: **{len(r.skipped)}**\n"
            f"- ✗ Failed: **{len(r.failed)}**\n"
            f"- ⊘ Cancelled: **{len(r.cancelled)}**\n"
        ]
        if r.succeeded:
            parts.append("\n### Successful\n" + "\n".join(
                f"- {x.label}" + ("" if x.verified else " *(not independently verified)*")
                for x in r.succeeded))
        if r.skipped:
            parts.append("\n### Skipped\n" + "\n".join(f"- {x.label} ({x.error})" for x in r.skipped))
        if r.failed:
            lines = []
            for x in r.failed:
                err = (x.error or "").replace("\n", " ").replace("`", "'")[:200]
                lines.append(
                    f"- **{x.label}** — attempts: {x.attempts}; error: `{err}`\n"
                    f"  log: `{x.log_path}`\n"
                    f"  Tip: search the exact error together with your Fedora release "
                    f"(ask.fedoraproject.org or the upstream project's issue tracker)."
                )
            parts.append("\n### Failed\n" + "\n".join(lines))
        parts.append(
            f"\nDiagnostic logs: `{self.log_dir}`\n"
            f"Machine-readable report: `{self.log_dir.parent / 'report.json'}`"
        )
        return "".join(parts)

    def action_quit(self) -> None:
        self.app.exit()


class FedUpApp(App):
    """Fed-up Textual application."""

    TITLE = "Fed-up"
    SUB_TITLE = f"Fedora 43/44 setup · v{__version__}"
    ENABLE_COMMAND_PALETTE = False

    CSS = """
    Screen { background: $surface; }
    #notice { alignment: center middle; width: 90%; max-width: 110; padding: 0 1; }
    #notice-body { max-height: 100%; }
    #confirm { align: center middle; width: 80%; max-width: 100; padding: 0 1; }
    #confirm-body { max-height: 70%; }
    Checkbox { padding: 0 1; width: 100%; }
    .cat-head { padding: 1 1 0 1; }
    .status-line { padding: 0 1; }
    """

    BINDINGS = [Binding("q", "quit", "Quit")]

    def __init__(self, config_path: str = "", items: list[dict] | None = None,
                 verbose: bool = False, log_dir: Path | None = None):
        super().__init__()
        self.catalog_items = items if items is not None else (load_catalog(config_path) if config_path else [])
        self.verbose = verbose
        self.log_dir = Path(log_dir) if log_dir else InstallRunner().log_dir
        self.runner: InstallRunner | None = None

    def on_mount(self) -> None:
        if not self.catalog_items:
            self.show_error("No installation items found. Check data.json.")
            return
        self.push_screen(NoticeScreen(), self._after_notice)

    def _after_notice(self, accepted: bool | None) -> None:
        if accepted:
            self.push_screen(ReviewScreen(self.catalog_items, verbose=self.verbose))

    def show_error(self, message: str) -> None:
        print(f"Error: {message}", file=sys.stderr)
        self.exit(1)

    def action_quit(self) -> None:
        if self.runner:
            self.runner.cancel()
        self.exit()
