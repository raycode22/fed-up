# Fed-up - Fedora Post-Install Script Generator

A zero-build, static web application that generates a portable, interactive shell script (`setup.sh`) for Fedora Linux post-installation configurations.

## Project Structure

```
fed-up/
├── index.html          # Modern HTML5 interface
├── style.css           # Modern CSS (nesting, custom properties, :where() reset)
├── app.js              # Vanilla JS script assembly engine (ES2024+)
├── setup.sh            # Shell wrapper with pre-flight onboarding
├── README.md           # This file
```

## Features

- **Zero-build**: No npm dependencies, no build tools, no frameworks
- **GitHub Pages ready**: Deploy directly from `main` branch root
- **Modern web standards**: HTML5 semantic elements, CSS nesting, ES2024+ modules
- **dnf5 exclusive**: Uses native DNF5 syntax (no legacy yum)
- **gum TUI**: Interactive terminal UI using Charm's gum components
- **Python payload**: Embedded Python using `subprocess.run()` (no `os.system()`)

## Technologies

### Frontend
- HTML5 semantic elements (`<form>`, `<fieldset>`, `<legend>`, `<label>`, `<output>`, `<dialog>`)
- Modern CSS: Nesting, Custom Properties, `:where()` reset, Flexbox/Grid
- JavaScript: ES2024+ `<script type="module">`, `FormData`, `Blob`, `URL.createObjectURL()`
- Clipboard API: `navigator.clipboard.writeText()` (no `document.execCommand`)

### Shell Wrapper
- Shebang: `#!/usr/bin/env bash`
- Strict mode: `set -euo pipefail`
- Pre-flight banner with consent prompt (`[Y/n]`) before sudo
- Deferred bootstrapping: `sudo dnf5 install -y python3 gum`
- Single-quoted heredoc payload extraction
- Signal trapping: `trap 'rm -f "$TEMP_PY"' EXIT INT TERM`

### Python Payload
- `subprocess.run(..., check=True, text=True)` with `CalledProcessError` handling
- No `os.system()` usage

## Deployment

Deploy directly to GitHub Pages from the `main` branch root.

1. Push all files to `main` branch
2. Enable GitHub Pages in repository settings
3. Select `main` branch as source
4. Site is available at `https://<user>.github.io/fed-up/`

## Usage

1. Open `index.html` in a web browser
2. Select desired post-installation options
3. Click "Copy script" or "Download script" to get `setup.sh`
4. Run `setup.sh` on your Fedora system
5. Consent will be requested before any sudo operations

## License

MIT License