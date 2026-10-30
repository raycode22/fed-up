import argparse
import json
import os
import sys

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import (
    Button,
    Checkbox,
    Footer,
    Header,
    Label,
    ListView,
    ListItem,
    Static,
)

from . import __version__


class SafetyNoticeScreen(Screen):
    """Safety notice screen shown on startup."""

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("enter", "continue", "Continue"),
        Binding("space", "continue", "Continue"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Static("Fed-up Safety Notice\n\nSome operations require sudo and may modify system configuration.\nNetwork access is used for package downloads/repository metadata.\nNo personal data is collected by Fed-up itself (verify in docs).\n\nPress Enter or Space to continue, or q to quit.", id="notice",)
        yield Footer()

    def action_continue(self) -> None:
        self.app.pop_screen()

    def action_quit(self) -> None:
        self.app.exit()

class ItemReviewScreen(Screen):
    """Item review and selection screen."""

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("r", "select_recommended", "Select Recommended"),
        Binding("a", "select_all", "Select All"),
        Binding("c", "clear_all", "Clear All"),
    ]

    def __init__(self, items: list[dict]):
        super().__init__()
        self.items = items
        self.selected: set[str] = set()

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Static("Select the items you want to install:", id="title")
        yield Static("Use Space to toggle, Enter to confirm", id="hint")
        with Vertical(id="item-list"):
            for item in self.items:
                yield Checkbox(item.get("label", item["id"]), id=f"chk-{item['id']}")
        with Horizontal(id="buttons"):
            yield Button("Select Recommended", id="btn-recommended")
            yield Button("Select All", id="btn-all")
            yield Button("Clear All", id="btn-clear")
            yield Button("Confirm Selection", variant="primary", id="btn-confirm")
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-recommended":
            self.action_select_recommended()
        elif event.button.id == "btn-all":
            self.action_select_all()
        elif event.button.id == "btn-clear":
            self.action_clear_all()
        elif event.button.id == "btn-confirm":
            self.app.push_screen(ProgressScreen(self.get_selected_items()))

    def on_checkbox_changed(self, event: Checkbox.Changed) -> None:
        item_id = event.checkbox.id.replace("chk-", "")
        if event.value:
            self.selected.add(item_id)
        else:
            self.selected.discard(item_id)

    def get_selected_items(self) -> list[dict]:
        return [it for it in self.items if it["id"] in self.selected]

    def action_select_recommended(self) -> None:
        recommended = [it for it in self.items if it.get("status") == "recommended"]
        for it in recommended:
            self.selected.add(it["id"])
            try:
                cb = self.query_one(f"#chk-{it['id']}", Checkbox)
                cb.value = True
            except Exception:
                pass

    def action_select_all(self) -> None:
        for it in self.items:
            self.selected.add(it["id"])
            try:
                cb = self.query_one(f"#chk-{it['id']}", Checkbox)
                cb.value = True
            except Exception:
                pass

    def action_clear_all(self) -> None:
        self.selected.clear()
        for it in self.items:
            try:
                cb = self.query_one(f"#chk-{it['id']}", Checkbox)
                cb.value = False
            except Exception:
                pass

    def action_quit(self) -> None:
        yield Footer()

    def action_continue(self) -> None:
        self.app.pop_screen()

    def action_quit(self) -> None:
        self.app.exit()
class ProgressScreen(Screen):
    """Progress screen showing installation status."""

    BINDINGS = [Binding("q", "quit", "Quit")]

    def __init__(self, items: list[dict]):
        super().__init__()
        self.items = items

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Static("Installation Progress", id="title")
        yield Static("Selected items:", id="subtitle")
        for it in self.items:
            yield Static(f"  • {it.get('label', it['id'])}", id=f"progress-{it['id']}")
        yield Static("Press q to quit", id="hint")
        yield Footer()

    def action_quit(self) -> None:
        self.app.exit()


class FedUpApp(App):
    """Fed-up Textual TUI application."""

    CSS = """
    Screen {
        background: $surface;
    }
    #notice, #title, #subtitle, #hint {
        margin: 1 2;
    }
    #item-list {
        height: auto;
        max-height: 60%;
        margin: 1 2;
        overflow-y: auto;
    }
    #buttons {
        height: auto;
        margin: 1 2;
    }
    Button {
        margin: 0 1;
    }
    Checkbox {
        margin: 0 2;
    }
    """

    BINDINGS = [Binding("q", "quit", "Quit")]

    def __init__(self, config_path: str = "", items: list[dict] | None = None):
        super().__init__()
        self.config_path = config_path
        self.items = items or []
        if not self.items and self.config_path:
            self._load_items()

    def _load_items(self):
        try:
            with open(self.config_path) as f:
                data = json.load(f)
            for cat in data.get("categories", []):
                for it in cat.get("items", []):
                    self.items.append(it)
        except Exception as exc:
            print(f"Error loading config: {exc}", file=sys.stderr)

    def on_mount(self) -> None:
        if not self.items:
            print("Error: no installation items found. Check data.json.", file=sys.stderr)
            self.exit(1)
            return
        self.push_screen(SafetyNoticeScreen())
        self.push_screen(ItemReviewScreen(self.items))

    def action_quit(self) -> None:
        self.exit()


def main(argv=None):
    parser = argparse.ArgumentParser(prog="fedup-tui", description="Fed-up terminal installer")
    parser.add_argument("--config", help="Path to data.json")
    parser.add_argument("--items", default="", help="Comma-separated list of item ids")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args(argv)

    items = []
    if args.config and os.path.exists(args.config):
        try:
            with open(args.config) as f:
                data = json.load(f)
            for cat in data.get("categories", []):
                for it in cat.get("items", []):
                    items.append(it)
        except Exception as exc:
            print(f"Error loading config: {exc}", file=sys.stderr)

    if args.items:
        wanted = set(x.strip() for x in args.items.split(",") if x.strip())
        items = [it for it in items if it.get("id") in wanted]

    app = FedUpApp(config_path=args.config or "", items=items)
    return app.run()


if __name__ == "__main__":
    raise SystemExit(main())