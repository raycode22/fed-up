import curses
import json
import os


def load_items(args):
    items = []
    config_path = args.config
    if not config_path:
        if os.path.exists("web/data.json"):
            config_path = "web/data.json"
        elif os.path.exists("data.json"):
            config_path = "data.json"
    if config_path and os.path.exists(config_path):
        try:
            with open(config_path) as f:
                data = json.load(f)
            for cat in data.get("categories", []):
                for it in cat.get("items", []):
                    items.append(it)
        except Exception as exc:
            print(f"Warning: could not read config {config_path}: {exc}",
                   file=__import__("sys").stderr)
    if args.items:
        wanted = set(x.strip() for x in args.items.split(",") if x.strip())
        items = [it for it in items if it.get("id") in wanted]
    return items


def safe_addstr(win, y, x, text, attr=0):
    h, w = win.getmaxyx()
    if y < 0 or y >= h or x < 0 or x >= w:
        return
    try:
        win.addstr(y, x, text[: max(0, w - x - 1)], attr)
    except curses.error:
        pass


def init_colors():
    if not curses.has_colors():
        return
    curses.start_color()
    try:
        curses.use_default_colors()
    except Exception:
        pass
    curses.init_pair(1, curses.COLOR_CYAN, -1)
    curses.init_pair(2, curses.COLOR_GREEN, -1)
    curses.init_pair(3, curses.COLOR_YELLOW, -1)
    curses.init_pair(4, curses.COLOR_RED, -1)
    curses.init_pair(5, curses.COLOR_MAGENTA, -1)


def draw_header(win, title):
    h, w = win.getmaxyx()
    safe_addstr(win, 0, 2, "Fed-up", curses.color_pair(1) | curses.A_BOLD if curses.has_colors() else curses.A_BOLD)
    safe_addstr(win, 1, 2, "Simplify installing and configuring selected software on Fedora.", curses.A_DIM)
    safe_addstr(win, 2, 2, "─" * max(0, w - 4), curses.A_DIM)


def screen_notice(stdscr):
    stdscr.clear()
    init_colors()
    while True:
        stdscr.clear()
        draw_header(stdscr, "Safety Notice")
        lines = [
            "Fed-up installs/configures software on Fedora using dnf5 and related tools.",
            "Some operations require sudo and may modify system configuration.",
            "Network access is used for package downloads/repository metadata.",
            "No personal data is collected by Fed-up itself (verify in docs).",
            "",
            "Press any key to continue, or q to quit.",
        ]
        for i, line in enumerate(lines):
            safe_addstr(stdscr, 4 + i, 2, line)
        stdscr.refresh()
        ch = stdscr.getch()
        if ch in (ord("q"), ord("Q")):
            return False
        return True


def screen_review(stdscr, items):
    """Allow the user to review and select items with scrolling support."""
    idx = 0
    selected = set()
    sh, sw = stdscr.getmaxyx()
    visible = max(1, sh - 6)
    start_idx = 0

    def draw():
        stdscr.clear()
        draw_header(stdscr, "Review Items")
        safe_addstr(stdscr, 4, 2,
                    "Space: toggle  Enter: confirm  q: quit", curses.A_DIM)
        end = min(len(items), start_idx + visible)
        for i in range(start_idx, end):
            it = items[i]
            mark = "[x]" if it["id"] in selected else "[ ]"
            label = f"{mark} {it.get('label', it['id'])}"
            attr = curses.A_REVERSE if i == idx else 0
            row = 6 + (i - start_idx)
            try:
                stdscr.addstr(row, 2, label[: max(0, sw - 4)], attr)
            except curses.error:
                pass

    draw()
    stdscr.refresh()

    while True:
        ch = stdscr.getch()
        if ch == curses.KEY_UP and idx > 0:
            idx -= 1
            if idx < start_idx:
                start_idx = max(0, idx)
        elif ch == curses.KEY_DOWN and idx < len(items) - 1:
            idx += 1
            if idx >= start_idx + visible:
                start_idx = min(idx - visible + 1, max(0, len(items) - visible))
        elif ch == ord(" "):
            iid = items[idx]["id"]
            if iid in selected:
                selected.discard(iid)
            else:
                selected.add(iid)
        elif ch in (10, 13):
            return [it for it in items if it["id"] in selected]
        elif ch in (ord("q"), ord("Q")):
            return None

        draw()
        stdscr.refresh()



def run_ui(args, logger):
    items = load_items(args)
    if not items:
        print("Error: no installation items found. Check data.json.",
              file=__import__("sys").stderr)
        return 1

    def main(stdscr):
        curses.curs_set(0)
        if not screen_notice(stdscr):
            return 0
        chosen = screen_review(stdscr, items)
        if chosen is None:
            return 0
        # Progress screen
        stdscr.clear()
        draw_header(stdscr, "Progress")
        for i, it in enumerate(chosen):
            safe_addstr(stdscr, 4 + i, 2, f"Running {it.get('label', it['id'])}...")
            stdscr.refresh()
        stdscr.getch()
        # Summary
        stdscr.clear()
        draw_header(stdscr, "Summary")
        safe_addstr(stdscr, 4, 2, f"Completed {len(chosen)} item(s). Press any key to exit.")
        stdscr.refresh()
        stdscr.getch()
        return 0

    return curses.wrapper(main)
