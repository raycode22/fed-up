# Fed-up (Fedora Post-Installation Setup Script)

A Python-based terminal program that helps automate common setup and configuration tasks after installing **Fedora Workstation (Gnome)**
It allows you to choose what to install, update, or configure, and includes smart checks to skip tasks already done.

---

## Features

- Interactive terminal menu for **selecting setup tasks**
- Automatically detects **already installed packages or settings**
- Supports **DNF**, **Flatpak**, and **system configuration** tasks
- Organized by categories (**Essentials**, **Multimedia**, **GNOME**, **Developer Tools**, etc.)
- Safe to **re-run** — skips items that are already applied
- Runs all commands with proper **system checks**

---

## Requirements

- Fedora Linux 43 (or newer)
- Python 3.x
- Root privileges (**sudo** access)
- Internet connection (for package installations and updates)

---

## Installation

1. Clone or download this repository:

   ```bash
   git clone https://github.com/yourusername/fed-up.git
   cd fed-up
   ```

2. Clone or download this repository:

   ```bash
   chmod +x fedora_setup_tool.py
   ```

3. Clone or download this repository:

   ```bash
   sudo ./fedora_setup_tool.py
   ```

## Usage

When you run the script, a terminal menu will appear showing task categories and options.
You can:

- Select specific tasks by typing their numbers (example: `1,3,7`)
- Use a range of numbers (example: `5-8`)
- Run all tasks by typing `all`
- Exit the script by typing `q`

The tool will show which tasks are already installed or configured and skip them automatically.
After completing tasks, it returns to the main menu so you can select more.

---

## Example Tasks

- Update all system packages
- Enable RPM Fusion and Flathub repositories
- Install multimedia codecs and drivers
- Configure DNF performance settings
- Install developer tools, GNOME Tweaks, Timeshift, and more

---

## Notes

- Always run as **root** (use `sudo`)
- The script modifies system files like `/etc/dnf/dnf.conf` when needed
- You can safely rerun it anytime to ensure your Fedora setup stays consistent

```

```
