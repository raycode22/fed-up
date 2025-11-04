Fedora 43 Post-Installation Setup Script

This Python script provides a simple, TUI-based (Terminal User Interface) wizard to run common post-installation tasks on a fresh Fedora 43 Workstation install.

It is designed to be safe, transparent, and easy to use. It runs all commands with sudo and allows you to select exactly which tasks you want to perform.

Features

Interactive Menu: A clean, color-coded terminal interface.

Categorized Tasks: Tasks are grouped into logical sections like "Essentials," "Multimedia," and "Developer Setup."

Selective Installation: Choose one or more tasks to run at once (e.g., 1,3,7).

Install Everything: A simple all command to run every task in the script.

Safe & Transparent: The script shows you which command is being executed in real-time and provides clear success or failure messages.

No External Dependencies: Uses only built-in Python modules, so it runs on a fresh Fedora install.

How to Use

Download the Script:
Save the script as fedora_setup.py.

Make the Script Executable:
Open a terminal in the directory where you saved the file and run:

chmod +x fedora_setup.py


Run the Script with Root Privileges:
The script must be run with sudo to have the necessary permissions to install software and modify system configurations.

sudo ./fedora_setup.py


The script will check if it's running as root and will exit if it's not.

Follow the On-Screen Menu:

The script will display a menu of all available tasks, grouped by category and numbered.

At the prompt, enter the numbers of the tasks you wish to run, separated by commas (e.g., 1,2,4,7).

To run every single task, simply type all.

To quit without making any changes, type q.

Available Tasks

1. Essentials (Must-Do)

[1] Run Full System Update: Runs dnf upgrade --refresh to get all the latest security patches and updates.

[2] Enable RPM Fusion Repos: Adds the rpmfusion-free and rpmfusion-nonfree repositories, which are essential for drivers, codecs, and more.

[3] Enable Flathub Repository: Adds the main Flathub remote for Flatpak applications.

2. Multimedia & Drivers

[4] Install Multimedia Codecs: Installs ffmpeg, gstreamer plugins, and other packages needed to play common audio and video formats.

[5] Install Proprietary NVIDIA Drivers: Installs akmod-nvidia and xorg-x11-drv-nvidia-cuda for NVIDIA GPUs. (A reboot is recommended after this).

[6] Install Hardware Video Acceleration: Installs drivers for Intel and AMD graphics to improve video playback performance.

3. GNOME Customization & Utilities

[7] Install GNOME Tweaks & Extensions Manager: Adds the two most essential tools for customizing the GNOME desktop.

[8] Install System Backup Tool (Timeshift): Installs Timeshift, a popular tool for creating system snapshots.

[9] Install Advanced System Monitor (btop): Installs the btop terminal-based system monitor.

[10] Install Extra Archive/Compression Support: Adds support for .rar and .7z files.

4. Power-User & Laptop Tools

[11] Install TLP (Laptop Battery Optimization): Installs and enables TLP for better battery life on laptops. (Masks the default power-profiles-daemon).

[12] Install Preload (Faster App Launching): Installs a daemon that learns your app usage and pre-loads them into memory for faster startup.

5. Developer Setup

[13] Install 'Development Tools' Group: Installs gcc, make, and other essentials for compiling software.

[14] Install Git & Podman: Installs Git (version control) and Podman (Fedora's Docker alternative).

[15] Install Visual Studio Code: Adds the official Microsoft repository and installs code.

[16] Install Google Chrome: Adds the official Google repository and installs google-chrome-stable.

Note

This script is intended for a standard Fedora 43 Workstation (GNOME) installation. Some tasks (like NVIDIA drivers or TLP) may not be necessary or desirable for all hardware or for other Fedora "Spins" (like KDE, XFCE).