# Fedora 43 Post-Installation Setup Script

This Python script provides a simple, TUI-based (Terminal User Interface) wizard to run common post-installation tasks on a fresh **Fedora 43 Workstation** install.

It is designed to be safe, transparent, and easy to use. It runs all commands with `sudo` and allows you to select exactly which tasks you want to perform.

---

## Features

- **Interactive Menu:** A clean, color-coded terminal interface.
- **Categorized Tasks:** Tasks are grouped into logical sections like _Essentials_, _Multimedia_, and _Developer Setup_.
- **Selective Installation:** Choose one or more tasks to run at once (e.g., `1,3,7`).
- **Install Everything:** A simple `all` command to run every task in the script.
- **Safe & Transparent:** The script shows you which command is being executed in real-time and provides clear success or failure messages.
- **No External Dependencies:** Uses only built-in Python modules, so it runs on a fresh Fedora install.

---

## How to Use

### 1. Download the Script

Save the script as `fedora_setup.py`.

### 2. Make the Script Executable

Open a terminal in the directory where you saved the file and run:

```bash
chmod +x fedora_setup.py

```
