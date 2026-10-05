# Fed-up

Fed-up is a small web app for building setup scripts for Fedora Linux. Choose the software and system changes you want, review the generated script, and download it to run on your computer.

The app runs in your browser and does not install software itself. Setup choices are unselected by default. Choose individual items or use **Select recommended**.

## Use the app

Open the hosted app, or run Fed-up locally as described below.

1. Choose the setup items you need.
2. Generate the script and read it before running it.
3. Run the downloaded script in a terminal on a Fedora computer.

Setup scripts check that they are running on Fedora and that required tools are available. Guided mode asks before each item. Use `--quiet` to hide successful command output or `--verbose` to show it. Use `--yes` to run all selected items without these prompts. This requires an active sudo session; run `sudo -v` first. Add `--quiet` to hide successful output in this mode.

Cleanup and revert scripts may remove packages. Review the changes proposed by DNF before confirming them.

## Run locally

You need Python 3 and a terminal. From the project folder, run:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python build/build.py
python -m http.server 8000 --directory web
```

Open <http://localhost:8000> in your browser. Keep the server running while using the app. On Windows, activate the virtual environment with `.venv\Scripts\Activate.ps1` in PowerShell instead of the `source` command.

## Make changes

Setup options are defined in YAML files in `config/`. After changing them, run `python build/build.py` to validate the configuration and update `web/data.json`.

Run the tests with:

```bash
python -m pytest build/tests.py
```

## Project files

| Folder | Purpose |
| --- | --- |
| `config/` | Setup option definitions |
| `build/` | Configuration checks, data generation, and tests |
| `web/` | The app and its generated data |
| `docs/` | Development and project notes |
