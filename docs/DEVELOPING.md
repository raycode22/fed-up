# Developing the Fedora Automation Tool

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Regenerate the static data

```bash
python build/build.py
```

This creates `web/data.json`, which is consumed by the front-end interface.
