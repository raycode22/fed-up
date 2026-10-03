# Fedora Automation Tool

A lightweight static web app for generating a custom Fedora setup script.

## What it does

The app lets you choose from curated Fedora workstation packages, media tools, development environments and system tweaks. It then generates a downloadable Bash script you can run locally on a Fedora system.

Setup options start unselected. Use **Select recommended** to include recommended options or choose items individually before generating the script.

## Project structure

- `config/` — YAML definitions for packages and system changes.
- `build/` — validation and generation pipeline.
- `web/` — static HTML/CSS/JS app.
- `docs/` — operational docs.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python build/build.py
python -m pytest build/tests.py
```

Then open `web/index.html` in a browser or serve the folder with a local web server.

## Generated output

The build pipeline reads YAML files and writes `web/data.json` for the front-end to render.
