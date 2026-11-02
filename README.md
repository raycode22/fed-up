# Fed-up

Fed-up is an independent, unofficial, static browser application that generates Fedora Linux setup and revert scripts. It is not affiliated with or endorsed by the Fedora Project or Red Hat.

## Run locally

Open `index.html` in a modern browser, choose a Fedora release and desktop, select options, review the complete generated script, and download it. The site never executes commands on your computer. Generated scripts run only when you choose to run them.

The application has no framework, build step, backend, database, external runtime dependency, analytics, tracking, cookies, or network API. The only external links are opened if you choose to follow them. Browser storage is used locally for theme, text size, and selections.

## Script safety and limitations

- Generated scripts contain an embedded Python standard-library payload; they make no requests to this website at runtime.
- The shell wrapper checks Fedora and installs missing `python3`. Flatpak is installed from Fedora repositories only if an action selected in the installer needs it and it is not already present. The payload uses Python's standard library; pip is not required.
- When run in a terminal, the installer presents a preflight review of the website's selections. You can add or remove any verified, supported catalog action, edit supported values, and review each action's risk, reversibility, source, requirements, conflicts, and curated documentation links. Dependencies are added explicitly; conflicting selections must be resolved. Items without a safe supported automated action remain visible but cannot be selected.
- Charm `gum` is optional and presentation-only. It is offered from the configured Fedora repositories only during an interactive, non-quiet run; otherwise numbered text menus and prompts are used. The action review is grouped by category, and normal interactive runs show a lightweight terminal spinner while commands are working.
- Flatpak installations keep Flatpak's own permission and transaction prompt visible; `--yes` explicitly opts into Flatpak's assume-yes behavior.
- Failed actions can be retried up to three total attempts, skipped with a reason, or used to quit. The final summary separates completed, skipped, failed, and unavailable actions. Returning to the menu does not repeat completed actions.
- Installer options: normal output shows progress, `--quiet` suppresses routine progress while retaining warnings and the final summary, and `--verbose` shows command output; `--yes` automatically approves confirmations; and `--quit` exits before setup or prerequisite checks. `--yes` does not bypass input validation, Fedora checks, or privilege checks. These options can also be changed from the interactive menu where available.
- The DNF automatic-update option installs Fedora's `dnf5-plugin-automatic` and enables `dnf-automatic.timer`. Fedora's default configuration downloads updates without installing them; review `/etc/dnf/automatic.conf` before changing that behavior. See Fedora's [automatic updates guide](https://docs.fedoraproject.org/en-US/quick-docs/autoupdates/).
- System changes require administrator privileges. The payload passes subprocess arguments as lists and rejects malformed hostname and network-interface values.
- A script has to be reviewed before running. Firmware updates, cleanup, package updates, DNF settings, and some network changes cannot be fully reversed.
- Items without a safe supported automated install action remain visible but disabled. Verified manual routes include source and documentation links; the installer does not silently run vendor downloads, remote shell scripts, or repository setup that needs a separate trust decision.
- Catalog release applicability is not a guarantee that every package is available for every selected Fedora version. EOL releases may have unavailable repositories; confirm the generated package sources and Fedora's current support status before running a script.
- The checked-in `setup.sh` is a retired launcher that deliberately exits; use the browser-generated download instead of executing a stale prebuilt script.

## Data sources

- Fedora release status: [Fedora release EOL list](https://docs.fedoraproject.org/en-US/releases/eol/) and [Fedora 43 schedule](https://fedorapeople.org/groups/schedule/f-43/f-43-key-tasks.html), [Fedora 44 schedule](https://fedorapeople.org/groups/schedule/f-44/f-44-key-tasks.html). Fedora 41 and 42 are end of life; 43 and 44 are supported as of the current schedule.
- Fedora visual reference: [fedoraproject.org](https://fedoraproject.org), including its published stylesheet. The interface uses the Fedora site's Open Sans typography and sampled blue palette; it does not use Fedora marks or branding.
- Repository: [raycode22/fed-up](https://github.com/raycode22/fed-up)

## License

This project is distributed under the MIT License. Inline interface icon glyphs are based on Lucide, distributed under the ISC License. No third-party app logos are reproduced.
