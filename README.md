# Fed-up

Fed-up is an independent, unofficial, static browser application that generates Fedora Linux setup and revert scripts. It is not affiliated with or endorsed by the Fedora Project or Red Hat.

## Run locally

Open `index.html` in a modern browser, choose a Fedora release and desktop, select options, review the complete generated script, and download it. The site never executes commands on your computer. Generated scripts run only when you choose to run them.

The application has no framework, build step, backend, database, external runtime dependency, analytics, tracking, cookies, or network API. The only external links are opened if you choose to follow them. Browser storage is used locally for theme, text size, and selections.

## Script safety and limitations

- Generated scripts contain an embedded Python standard-library payload; they make no requests to this website at runtime.
- The shell wrapper checks Fedora and installs missing `python3` and `flatpak` only when selected operations require it. The payload uses Python's standard library; pip is not required.
- Charm `gum` is optional, presentation-only, and offered only from the configured Fedora repositories when available. Plain-text confirmations remain available.
- System changes require administrator privileges. The payload passes subprocess arguments as lists and rejects malformed hostname and network-interface values.
- A script has to be reviewed before running. Firmware updates, cleanup, package updates, DNF settings, and some network changes cannot be fully reversed.
- Items marked **Needs verification** remain visible but are disabled for script generation until their official source and installation instructions are confirmed.
- Catalog release applicability is not a guarantee that every package is available for every selected Fedora version. EOL releases may have unavailable repositories; confirm the generated package sources and Fedora's current support status before running a script.
- The checked-in `setup.sh` is a retired launcher that deliberately exits; use the browser-generated download instead of executing a stale prebuilt script.

## Data sources

- Fedora release status: [Fedora release EOL list](https://docs.fedoraproject.org/en-US/releases/eol/) and [Fedora 43 schedule](https://fedorapeople.org/groups/schedule/f-43/f-43-key-tasks.html), [Fedora 44 schedule](https://fedorapeople.org/groups/schedule/f-44/f-44-key-tasks.html). Fedora 41 and 42 are end of life; 43 and 44 are supported as of the current schedule.
- Fedora visual reference: [fedoraproject.org](https://fedoraproject.org), including its published stylesheet. The interface uses the Fedora site's Open Sans typography and sampled blue palette; it does not use Fedora marks or branding.
- Repository: [raycode22/fed-up](https://github.com/raycode22/fed-up)

## License

This project is distributed under the MIT License. Inline interface icon glyphs are based on Lucide, distributed under the ISC License. No third-party app logos are reproduced.
