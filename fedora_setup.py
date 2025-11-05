#!/usr/bin/env python3

"""
Fedora 43 Post-Installation Setup Script

This script provides an interactive, terminal-based menu to automate
common post-installation tasks. It checks for existing installations
and configurations to avoid redundant work.

Usage:
  1. Make the script executable:
     chmod +x fedora_setup_tool.py
  2. Run the script with root privileges:
     sudo ./fedora_setup_tool.py
"""

import sys
import os
import subprocess
import time
import threading


# --- ANSI Color Codes for a Modern Look ---
class C:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


# --- Task Definitions ---
# Based on https://www.debugpoint.com/10-things-to-do-fedora-43-after-install/
# and other common user tasks.
TASKS = {
    "1. Essentials (Must-Do)": [
        {
            "id": "1",
            "desc": "Run Full System Update (dnf upgrade)",
            "type": "shell",
            "commands": [["dnf", "upgrade", "--refresh", "-y"]],
        },
        {
            "id": "2",
            "desc": "Enable RPM Fusion Repos (Free & Non-Free)",
            "type": "shell",  # Use shell for the URL, check logic is trickier
            "commands": [
                [
                    "dnf",
                    "install",
                    "-y",
                    "https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm",
                    "https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm",
                ]
            ],
            "check_type": "file",
            "check_path": "/etc/yum.repos.d/rpmfusion-free.repo",
        },
        {
            "id": "3",
            "desc": "Apply Common DNF Tweaks (fastestmirror, parallel, deltarpm)",
            "type": "config",
            "config_file": "/etc/dnf/dnf.conf",
            "config_lines": [
                "max_parallel_downloads=10",
                "fastestmirror=True",
                "deltarpm=True",
            ],
        },
        {
            "id": "4",
            "desc": "Enable Flathub Repository",
            "type": "shell",
            "commands": [
                [
                    "flatpak",
                    "remote-add",
                    "--if-not-exists",
                    "flathub",
                    "https://flathub.org/repo/flathub.flatpakrepo",
                ]
            ],
            "check_type": "shell_grep",
            "check_command": ["flatpak", "remotes"],
            "check_grep": "flathub",
        },
    ],
    "2. Multimedia & Drivers": [
        {
            "id": "5",
            "desc": "Install Multimedia Codecs (gstreamer, ffmpeg)",
            "type": "dnf",
            "packages": [
                "gstreamer1-plugins-bad-freeworld",
                "gstreamer1-plugins-ugly",
                "ffmpeg",
            ],
            "commands": [
                ["dnf", "swap", "ffmpeg-free", "ffmpeg", "--allowerasing", "-y"],
                [
                    "dnf",
                    "groupupdate",
                    "multimedia",
                    "--setop=install_weak_deps=False",
                    "--exclude=PackageKit-gstreamer-plugin",
                    "-y",
                ],
                ["dnf", "groupupdate", "sound-and-video", "-y"],
            ],
        },
        {
            "id": "6",
            "desc": "Install Proprietary NVIDIA Drivers",
            "type": "dnf",
            "packages": ["akmod-nvidia", "xorg-x11-drv-nvidia-cuda"],
            "commands": [
                ["dnf", "install", "-y", "akmod-nvidia", "xorg-x11-drv-nvidia-cuda"]
            ],
        },
        {
            "id": "7",
            "desc": "Install VLC Media Player",
            "type": "dnf",
            "packages": ["vlc"],
            "commands": [["dnf", "install", "-y", "vlc"]],
        },
    ],
    "3. GNOME & Utilities": [
        {
            "id": "8",
            "desc": "Install GNOME Tweaks",
            "type": "dnf",
            "packages": ["gnome-tweaks"],
            "commands": [["dnf", "install", "-y", "gnome-tweaks"]],
        },
        {
            "id": "9",
            "desc": "Install 'Extension Manager' (from Flathub)",
            "type": "flatpak",
            "package_name": "com.mattjakeman.ExtensionManager",
            "commands": [
                [
                    "flatpak",
                    "install",
                    "flathub",
                    "com.mattjakeman.ExtensionManager",
                    "-y",
                ]
            ],
        },
        {
            "id": "10",
            "desc": "Enable Window Minimize & Maximize Buttons",
            "type": "shell",
            "commands": [
                [
                    "gsettings",
                    "set",
                    "org.gnome.desktop.wm.preferences",
                    "button-layout",
                    "appmenu:min,max,close",
                ]
            ],
            "check_type": "shell_grep",
            "check_command": [
                "gsettings",
                "get",
                "org.gnome.desktop.wm.preferences",
                "button-layout",
            ],
            "check_grep": "min,max,close",
        },
        {
            "id": "11",
            "desc": "Install System Backup Tool (Timeshift)",
            "type": "dnf",
            "packages": ["timeshift"],
            "commands": [["dnf", "install", "-y", "timeshift"]],
        },
        {
            "id": "12",
            "desc": "Install Advanced System Monitor (btop)",
            "type": "dnf",
            "packages": ["btop"],
            "commands": [["dnf", "install", "-y", "btop"]],
        },
        {
            "id": "13",
            "desc": "Install EasyEffects (Audio Post-Processing)",
            "type": "dnf",
            "packages": ["easyeffects"],
            "commands": [["dnf", "install", "-y", "easyeffects"]],
        },
    ],
    "4. Power-User & Laptop Tools": [
        {
            "id": "14",
            "desc": "Install TLP (Laptop Battery Optimization)",
            "type": "dnf",
            "packages": ["tlp", "tlp-rdw"],
            "commands": [
                ["dnf", "install", "-y", "tlp", "tlp-rdw"],
                ["systemctl", "mask", "power-profiles-daemon"],
                ["systemctl", "enable", "--now", "tlp"],
            ],
        },
        {
            "id": "15",
            "desc": "Install Preload (Faster App Launching)",
            "type": "dnf",
            "packages": ["preload"],
            "commands": [
                ["dnf", "install", "-y", "preload"],
                ["systemctl", "enable", "--now", "preload"],
            ],
        },
    ],
    "5. Developer Setup": [
        {
            "id": "16",
            "desc": "Install 'Development Tools' Group (gcc, make, etc.)",
            "type": "group",
            "group_name": "Development Tools",
            "commands": [["dnf", "groupinstall", "-y", "Development Tools"]],
        },
        {
            "id": "17",
            "desc": "Install Visual Studio Code (Microsoft Repo)",
            "type": "dnf",
            "packages": ["code"],
            "commands": [
                [
                    "rpm",
                    "--import",
                    "https://packages.microsoft.com/keys/microsoft.asc",
                ],
                [
                    "sh",
                    "-c",
                    'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo',
                ],
                ["dnf", "check-update"],
                ["dnf", "install", "-y", "code"],
            ],
        },
    ],
}

# --- Global Spinner Control ---
spinner_running = False
spinner_stop_event = threading.Event()


def clear_screen():
    """Clears the terminal screen."""
    os.system("clear")


def check_root():
    """Checks if the script is run as root. Exits if not."""
    if os.geteuid() != 0:
        print(f"{C.FAIL}{C.BOLD}Error:{C.ENDC} This script must be run as root.")
        print(f"Please run it with: {C.GREEN}sudo ./fedora_setup_tool.py{C.ENDC}")
        sys.exit(1)


def show_spinner(message=""):
    """Displays a brick-style spinner animation in a separate thread."""
    global spinner_running
    spinner_running = True
    spinner_chars = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"]

    sys.stdout.write(f"\n {C.CYAN}{message} {C.ENDC}")

    i = 0
    while not spinner_stop_event.is_set():
        char = spinner_chars[i % len(spinner_chars)]
        sys.stdout.write(f"\r {C.CYAN}{message} {char}{C.ENDC}")
        sys.stdout.flush()
        time.sleep(0.05)
        i += 1

    sys.stdout.write("\r" + " " * (len(message) + 5) + "\r")  # Clear the line
    sys.stdout.flush()
    spinner_running = False
    spinner_stop_event.clear()


def run_command(command, use_shell=False):
    """
    Runs a shell command, capturing stdout and stderr.
    Returns (success, stdout, stderr)
    """
    try:
        # Use shell=True only when needed (e.g., for rpm -E)
        if "rpm -E" in " ".join(command) or ">" in " ".join(command):
            use_shell = True

        process = subprocess.run(
            " ".join(command) if use_shell else command,
            shell=use_shell,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        return (True, process.stdout, process.stderr)
    except subprocess.CalledProcessError as e:
        return (False, e.stdout, e.stderr)
    except FileNotFoundError as e:
        return (False, "", f"Command not found: {e.filename}")


def check_package_installed(pkg_name):
    """Checks if a single RPM package is installed."""
    success, _, _ = run_command(["rpm", "-q", pkg_name])
    return success


def check_flatpak_installed(pkg_name):
    """Checks if a single Flatpak package is installed."""
    success, stdout, _ = run_command(
        ["flatpak", "list", "--app", "--columns=application"]
    )
    if success:
        for line in stdout.splitlines():
            if line.strip() == pkg_name:
                return True
    return False


def check_group_installed(group_name):
    """Checks if a DNF group is already installed."""
    success, stdout, _ = run_command(["dnf", "group", "info", group_name])
    if success:
        # Check for "Installed" in the output
        if "Installed" in stdout or "Installed Groups" in stdout:
            return True
    return False


def check_config_applied(config_file, config_line):
    """Checks if a specific line already exists in a config file."""
    if not os.path.exists(config_file):
        return False
    try:
        with open(config_file, "r") as f:
            for line in f:
                if config_line.strip() == line.strip():
                    return True
    except (IOError, PermissionError) as e:
        print(f" {C.FAIL}Error reading config {config_file}: {e}{C.ENDC}")
        return False  # Assume not applied if we can't read
    return False


def apply_config(config_file, config_line):
    """Appends a line to a config file."""
    try:
        with open(config_file, "a") as f:
            f.write(f"\n{config_line}\n")
        return (True, "", "")
    except (IOError, PermissionError) as e:
        return (False, "", f"Could not write to {config_file}: {e}")


def run_task(task):
    """
    Runs a single task, checking its type and whether it's already done.
    Returns True on success/skip, False on failure.
    """
    title = task["desc"]
    task_type = task.get("type", "shell")
    all_done = True

    # --- Check if task is already completed ---
    if task_type == "dnf":
        packages = task.get("packages", [])
        # Check if all packages in the list are installed
        all_done = all(check_package_installed(pkg) for pkg in packages)
        if not packages:
            all_done = False  # If no packages listed, just run

    elif task_type == "flatpak":
        all_done = check_flatpak_installed(task["package_name"])

    elif task_type == "group":
        all_done = check_group_installed(task["group_name"])

    elif task_type == "config":
        all_done = all(
            check_config_applied(task["config_file"], line)
            for line in task["config_lines"]
        )

    elif task_type == "check_file":
        all_done = os.path.exists(task.get("check_path", ""))

    elif task_type == "shell_grep":
        success, stdout, _ = run_command(task["check_command"])
        all_done = success and task["check_grep"] in stdout

    else:
        all_done = False  # Default to running shell tasks

    if all_done:
        print(f" {C.WARNING}✔ Skipping: {title} (Already applied){C.ENDC}")
        return True

    # --- Run the task ---
    spinner_thread = threading.Thread(target=show_spinner, args=(f"Running: {title}",))
    spinner_thread.start()

    task_failed = False
    error_message = ""

    if task_type == "config":
        for line in task["config_lines"]:
            if not check_config_applied(task["config_file"], line):
                success, _, stderr = apply_config(task["config_file"], line)
                if not success:
                    task_failed = True
                    error_message = stderr
                    break
    else:
        for command in task["commands"]:
            # RPM Fusion URL needs shell=True to expand $(rpm -E %fedora)
            use_shell = "rpm -E" in " ".join(command) or ">" in " ".join(command)
            success, _, stderr = run_command(command, use_shell=use_shell)
            if not success:
                task_failed = True
                error_message = stderr
                break

    spinner_stop_event.set()
    spinner_thread.join()

    if task_failed:
        print(f" {C.FAIL}✘ FAILED: {title}{C.ENDC}")
        print(f"   {C.FAIL}Error: {error_message.splitlines()[-1]}{C.ENDC}")
        return False
    else:
        print(f" {C.GREEN}✔ SUCCESS: {title}{C.ENDC}")
        return True


def display_menu():
    """Prints the main selection menu."""
    clear_screen()
    print(f"{C.HEADER}{C.BOLD}========================================={C.ENDC}")
    print(f"{C.HEADER}{C.BOLD} Fedora 43 Post-Installation Setup Tool {C.ENDC}")
    print(f"{C.HEADER}{C.BOLD}========================================={C.ENDC}")
    print(f"Select tasks to perform (e.g., 1,3,7 or 5-8).\n")

    for category, tasks in TASKS.items():
        print(f"\n{C.BLUE}{C.BOLD}{category}{C.ENDC}")
        for task in tasks:
            print(f"  {C.GREEN}[{task['id'].rjust(2)}] {C.ENDC}{task['desc']}")

    print("\n" + "=" * 41)
    print(f"  {C.GREEN}[all] {C.ENDC}Run all tasks")
    print(f"  {C.GREEN}[q]   {C.ENDC}Quit the script\n")


def get_user_choices():
    """
    Gets and parses the user's task selections, supporting ranges.
    Returns a list of task IDs to run.
    """
    all_task_ids = {task["id"] for tasks in TASKS.values() for task in tasks}
    selected_ids = set()

    choice_str = input(f"{C.GREEN}❯ {C.ENDC}").strip().lower()

    if choice_str == "q" or choice_str == "quit":
        return "quit"

    if choice_str == "all":
        return sorted(list(all_task_ids), key=int)

    parts = choice_str.split(",")
    invalid_choices = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            # Handle range (e.g., 5-8)
            try:
                start, end = map(int, part.split("-"))
                if start > end:
                    start, end = end, start
                for i in range(start, end + 1):
                    task_id = str(i)
                    if task_id in all_task_ids:
                        selected_ids.add(task_id)
                    else:
                        invalid_choices.append(task_id)
            except ValueError:
                invalid_choices.append(part)
        else:
            # Handle single number
            if part.isdigit() and part in all_task_ids:
                selected_ids.add(part)
            else:
                invalid_choices.append(part)

    if invalid_choices:
        print(f"{C.FAIL}Error: Invalid task IDs: {', '.join(invalid_choices)}{C.ENDC}")
        time.sleep(2)
        return None  # Indicate error

    return sorted(list(selected_ids), key=int)


def main():
    """Main execution loop."""
    check_root()

    while True:
        display_menu()
        selected_ids = get_user_choices()

        if selected_ids == "quit":
            break

        if not selected_ids:
            continue  # Show menu again on invalid input

        # Create a flat map of all tasks by ID for easy lookup
        all_tasks_map = {task["id"]: task for tasks in TASKS.values() for task in tasks}

        print("\n" + "=" * 41)
        print(
            f"{C.HEADER}{C.BOLD}Starting setup for {len(selected_ids)} selected task(s)...{C.ENDC}"
        )
        time.sleep(1)  # Give user time to read

        tasks_succeeded = 0
        tasks_failed = []

        for task_id in selected_ids:
            task = all_tasks_map[task_id]
            print()  # Add space before each task

            if run_task(task):
                tasks_succeeded += 1
            else:
                tasks_failed.append(f"Task {task_id} ({task['desc']})")

        # --- Final Summary ---
        print("\n" + "=" * 41)
        print(f"{C.HEADER}{C.BOLD}Setup Run Complete{C.ENDC}")
        print(
            f"{C.GREEN}✔ {tasks_succeeded} task(s) succeeded or were skipped.{C.ENDC}"
        )

        if tasks_failed:
            print(f"{C.FAIL}✘ {len(tasks_failed)} task(s) failed:{C.ENDC}")
            for task_name in tasks_failed:
                print(f"   {C.FAIL}- {task_name}{C.ENDC}")

        print(f"\n{C.CYAN}Press Enter to return to the main menu...{C.ENDC}")
        input()  # Wait for user to continue


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # Ensure spinner stops if user presses Ctrl+C
        if spinner_running:
            spinner_stop_event.set()
        print(f"\n\n{C.WARNING}Script interrupted by user. Exiting.{C.ENDC}")
        sys.exit(1)
