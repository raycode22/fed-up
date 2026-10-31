// Trusted application catalog for the browser-side generator.
// Generated from config/*.yaml via `python build/build.py` — do not edit
// by hand. Loaded as a static ES module so script generation needs no
// fetch() and works even when opened without a web server.
export const CATALOG_META = {
  "site": {
    "name": "Fed-up",
    "tagline": "Build a custom Fedora workstation setup with one click.",
    "description": "Generate a personalized Fedora Linux setup script from a curated set of package, media, and system tweaks.",
    "version": "1.0.0",
    "author": "Ray Code",
    "default_branch": "main",
    "target_fedora_versions": [
      "43",
      "44"
    ],
    "license": "MIT",
    "repo_url": "https://github.com/raycode22/fed-up",
    "homepage": "https://raycode22.github.io/fed-up/"
  },
  "ui": {
    "title": "Fed-up",
    "subtitle": "System Setup Shell Script Builder for Fedora Linux",
    "script_name": "fedora-setup.sh"
  },
  "build": {
    "output_json": "web/data.json",
    "validate_on_run": true,
    "strict_mode": false
  }
};
export const CATALOG_ITEMS = [
  {
    "id": "rpmfusion-free",
    "label": "Enable RPM Fusion free repo",
    "description": "Add the RPM Fusion free repository for audio, video and open-source codecs.",
    "command": "sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "repo",
      "multimedia",
      "rpmfusion"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 10,
    "category": "dnf"
  },
  {
    "id": "rpmfusion-nonfree",
    "label": "Enable RPM Fusion nonfree repo",
    "description": "Add the RPM Fusion nonfree repository for proprietary codecs and drivers.",
    "command": "sudo dnf5 install -y https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "repo",
      "multimedia",
      "proprietary"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 20,
    "category": "dnf"
  },
  {
    "id": "faster-dnf",
    "label": "Enable fastest mirror detection",
    "description": "Improve DNF performance by enabling metadata and mirror optimization.",
    "command": "sudo dnf5 install -y dnf5-plugins && sudo dnf5 config-manager setopt max_parallel_downloads=10 && sudo dnf5 config-manager setopt fastestmirror=True",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "dnf",
      "performance"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 40,
    "category": "dnf"
  },
  {
    "id": "exclude-fedora-updates-testing",
    "label": "Remove Fedora Updates Testing",
    "description": "Keep the system stable by disabling the Fedora Updates Testing repository.",
    "command": "sudo dnf5 config-manager disable updates-testing",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "repo",
      "stability"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 50,
    "category": "dnf"
  },
  {
    "id": "dnf-automatic",
    "label": "Enable automatic updates",
    "description": "Install DNF automatic and configure a periodic daily update check.",
    "command": "sudo dnf5 install -y dnf5-plugin-automatic && sudo systemctl enable --now dnf5-automatic.timer",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "updates",
      "security"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 60,
    "category": "dnf"
  },
  {
    "id": "gnome-tweaks",
    "label": "Install GNOME Tweaks",
    "description": "Add GNOME Settings and an easy way to adjust desktop behavior.",
    "command": "sudo dnf5 install -y gnome-tweaks",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "gnome",
    "arch": "any",
    "recommended_on": [
      "gnome"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "desktop",
      "gnome"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 70,
    "category": "dnf"
  },
  {
    "id": "gnome-extensions-app",
    "label": "Install GNOME Extensions app",
    "description": "Adds the extensions management app for customizing the desktop.",
    "command": "sudo dnf5 install -y gnome-extensions-app",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "gnome",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "desktop",
      "gnome"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 80,
    "category": "dnf"
  },
  {
    "id": "firewall-default",
    "label": "Enable default firewall rules",
    "description": "Ensure the standard Fedora firewall is active.",
    "command": "sudo systemctl enable --now firewalld",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "security",
      "network"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 90,
    "category": "dnf"
  },
  {
    "id": "timeshift",
    "label": "Install Timeshift",
    "description": "Install a system restore utility for safer package and system changes.",
    "command": "sudo dnf5 install -y timeshift",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "backup",
      "stability"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 100,
    "category": "dnf"
  },
  {
    "id": "flatpak",
    "label": "Install Flatpak support",
    "description": "Enable Flatpak support and the Fedora Flatpak runtime.",
    "command": "sudo dnf5 install -y flatpak && sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "flatpak",
      "apps"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 110,
    "category": "dnf"
  },
  {
    "id": "google-chrome",
    "label": "Add Google Chrome repo",
    "description": "Add the official Google repository for installing Chrome.",
    "command": "sudo dnf5 install -y https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "browser",
      "repo"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 120,
    "category": "dnf"
  },
  {
    "id": "vlc",
    "label": "Install VLC",
    "description": "Play media files with the popular VLC media player.",
    "command": "sudo dnf5 install -y vlc",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "media",
      "player"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 10,
    "category": "multimedia"
  },
  {
    "id": "ffmpeg",
    "label": "Install FFmpeg",
    "description": "Add the FFmpeg stack for conversion, recording and streaming.",
    "command": "sudo dnf5 install -y ffmpeg ffmpeg-devel --allowerasing",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "media",
      "codec"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 20,
    "category": "multimedia"
  },
  {
    "id": "gstreamer-plugins",
    "label": "Install GStreamer plugins",
    "description": "Add GStreamer codecs and extra media support.",
    "command": "sudo dnf5 install -y gstreamer1-plugins-{base,good,bad-free,ugly} gstreamer1-plugin-libav gstreamer1-plugin-openh264",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "media",
      "codec"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 30,
    "category": "multimedia"
  },
  {
    "id": "steam",
    "label": "Install Steam",
    "description": "Add Valve's Steam client for gaming.",
    "command": "sudo dnf5 install -y steam",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-nonfree"
    ],
    "conflicts_with": [],
    "tags": [
      "gaming",
      "multimedia"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 40,
    "category": "multimedia"
  },
  {
    "id": "obs-studio",
    "label": "Install OBS Studio",
    "description": "Record and stream your desktop with OBS.",
    "command": "sudo dnf5 install -y obs-studio",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "streaming",
      "recording"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 50,
    "category": "multimedia"
  },
  {
    "id": "kde-multimedia",
    "label": "Install KDE media apps",
    "description": "Add media apps and codecs for KDE desktop users.",
    "command": "sudo dnf5 install -y kdenlive elisa-player",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "kde",
      "multimedia"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 60,
    "category": "multimedia"
  },
  {
    "id": "spotify",
    "label": "Install Spotify",
    "description": "Install the Spotify desktop client for streaming music.",
    "command": "sudo dnf5 config-manager addrepo --from-repofile=https://negativo17.org/repos/fedora-spotify.repo && sudo dnf5 install -y spotify-client",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "music",
      "apps"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 70,
    "category": "multimedia"
  },
  {
    "id": "libreoffice",
    "label": "Install LibreOffice",
    "description": "Add office productivity tools for working with documents and spreadsheets.",
    "command": "sudo dnf5 install -y libreoffice",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "office",
      "productivity"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 80,
    "category": "multimedia"
  },
  {
    "id": "adobe-reader",
    "label": "Install Adobe Reader alternatives",
    "description": "Install the Evince document viewer for PDF files.",
    "command": "sudo dnf5 install -y evince",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "office",
      "pdf"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 90,
    "category": "multimedia"
  },
  {
    "id": "handbrake",
    "label": "Install HandBrake",
    "description": "Transcode video files for backups and device compatibility.",
    "command": "sudo dnf5 install -y handbrake",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "rpmfusion-free"
    ],
    "conflicts_with": [],
    "tags": [
      "media",
      "transcode"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 100,
    "category": "multimedia"
  },
  {
    "id": "gamemode",
    "label": "Install GameMode",
    "description": "Optimize system performance for games.",
    "command": "sudo dnf5 install -y gamemode",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "gaming",
      "performance"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 130,
    "category": "multimedia"
  },
  {
    "id": "mangohud",
    "label": "Install MangoHud",
    "description": "Vulkan/OpenGL overlay for monitoring.",
    "command": "sudo dnf5 install -y mangohud",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "gaming",
      "monitoring"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 140,
    "category": "multimedia"
  },
  {
    "id": "zsh",
    "label": "Install Zsh",
    "description": "Install Zsh and make it available as a default shell.",
    "command": "sudo dnf5 install -y zsh && sudo usermod --shell \"$(command -v zsh)\" \"$USER\"",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "shell",
      "user-experience"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 10,
    "category": "tweaks"
  },
  {
    "id": "tlp",
    "label": "Install TLP",
    "description": "Add TLP to optimize laptop battery life and performance.",
    "command": "sudo dnf5 install -y tlp tlp-rdw && (sudo systemctl disable --now tuned 2>/dev/null || true) && sudo systemctl enable --now tlp",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "power",
      "battery"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 30,
    "category": "tweaks"
  },
  {
    "id": "ntfs-support",
    "label": "Install NTFS support",
    "description": "Add the NTFS tools needed to read and write Windows disks.",
    "command": "sudo dnf5 install -y ntfs-3g",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "filesystem",
      "compatibility"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 40,
    "category": "tweaks"
  },
  {
    "id": "virtualbox",
    "label": "Install VirtualBox",
    "description": "Add VirtualBox for local virtual machine experimentation.",
    "command": "sudo dnf5 install -y VirtualBox",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "virtualization",
      "vm"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 50,
    "category": "tweaks"
  },
  {
    "id": "libreoffice-fonts",
    "label": "Install extra fonts",
    "description": "Install Microsoft-compatible fonts and extra European scripts.",
    "command": "sudo dnf5 install -y adobe-source-code-pro-fonts dejavu-fonts-all liberation-fonts",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "fonts",
      "ui"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 60,
    "category": "tweaks"
  },
  {
    "id": "firewall-cockpit",
    "label": "Install Cockpit",
    "description": "Add Cockpit, a browser-based system administration tool.",
    "command": "sudo dnf5 install -y cockpit && sudo systemctl enable --now cockpit.socket",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "admin",
      "monitoring"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 70,
    "category": "tweaks"
  },
  {
    "id": "criu",
    "label": "Install CRIU support",
    "description": "Add checkpoint/restore tooling for advanced container workflows.",
    "command": "sudo dnf5 install -y criu",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "containers",
      "advanced"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 80,
    "category": "tweaks"
  },
  {
    "id": "git",
    "label": "Install Git",
    "description": "Add Git for version control and source code management.",
    "command": "sudo dnf5 install -y git",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "git",
      "version-control"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 10,
    "category": "development"
  },
  {
    "id": "gh",
    "label": "Install GitHub CLI",
    "description": "Install the GitHub command-line client for managing repositories.",
    "command": "sudo dnf5 install -y gh",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "git"
    ],
    "conflicts_with": [],
    "tags": [
      "git",
      "github"
    ],
    "status": "recommended",
    "impact": "low",
    "install_order": 20,
    "category": "development"
  },
  {
    "id": "python-tools",
    "label": "Install Python toolchain",
    "description": "Install Python, pip and common command-line utilities.",
    "command": "sudo dnf5 install -y python3 python3-pip python3-virtualenv python3-devel",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "python",
      "dev"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 30,
    "category": "development"
  },
  {
    "id": "nodejs",
    "label": "Install Node.js",
    "description": "Install Node.js and npm for JavaScript development.",
    "command": "sudo dnf5 install -y nodejs npm",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "node",
      "javascript"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 40,
    "category": "development"
  },
  {
    "id": "java-jdk",
    "label": "Install Java JDK",
    "description": "Install the OpenJDK runtime and development kit.",
    "command": "sudo dnf5 install -y java-latest-openjdk-devel",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "java",
      "sdk"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 50,
    "category": "development"
  },
  {
    "id": "rust",
    "label": "Install Rust toolchain",
    "description": "Install the Rust compiler and package manager for systems development.",
    "command": "curl https://sh.rustup.rs -sSf | sh -s -- -y",
    "requires_sudo": false,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "remote-script",
    "packages": [],
    "depends_on": [
      "git"
    ],
    "conflicts_with": [],
    "tags": [
      "rust",
      "systems"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 60,
    "category": "development"
  },
  {
    "id": "docker",
    "label": "Install Docker",
    "description": "Add Docker and Docker Compose for container workflows.",
    "command": "sudo dnf5 install -y docker docker-compose-plugin && sudo systemctl enable --now docker",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "containers",
      "docker"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 70,
    "category": "development"
  },
  {
    "id": "kubectl",
    "label": "Install Kubernetes tools",
    "description": "Add kubectl and related tooling for Kubernetes development.",
    "command": "sudo dnf5 install -y kubectl",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "kubernetes",
      "cloud"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 80,
    "category": "development"
  },
  {
    "id": "ansible",
    "label": "Install Ansible",
    "description": "Add Ansible and related tools for automation projects.",
    "command": "sudo dnf5 install -y ansible",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "automation",
      "devops"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 90,
    "category": "development"
  },
  {
    "id": "postgresql-client",
    "label": "Install PostgreSQL client",
    "description": "Add psql and related client tooling for local database work.",
    "command": "sudo dnf5 install -y postgresql",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "database",
      "postgresql"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 110,
    "category": "development"
  },
  {
    "id": "sqlite-tools",
    "label": "Install SQLite tools",
    "description": "Add SQLite3 and database utilities for lightweight development.",
    "command": "sudo dnf5 install -y sqlite sqlite-tools",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "database",
      "sqlite"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 120,
    "category": "development"
  },
  {
    "id": "fastfetch",
    "label": "Install fastfetch",
    "description": "Display system information in the terminal.",
    "command": "sudo dnf5 install -y fastfetch",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "cli",
      "info"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 130,
    "category": "development"
  },
  {
    "id": "ripgrep",
    "label": "Install ripgrep",
    "description": "Fast recursive search tool.",
    "command": "sudo dnf5 install -y ripgrep",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "cli",
      "search"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 140,
    "category": "development"
  },
  {
    "id": "bat",
    "label": "Install bat",
    "description": "Cat clone with syntax highlighting.",
    "command": "sudo dnf5 install -y bat",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "cli",
      "files"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 150,
    "category": "development"
  },
  {
    "id": "fd-find",
    "label": "Install fd",
    "description": "Fast and user-friendly find alternative.",
    "command": "sudo dnf5 install -y fd-find",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "cli",
      "files"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 160,
    "category": "development"
  },
  {
    "id": "htop",
    "label": "Install htop",
    "description": "Interactive process viewer.",
    "command": "sudo dnf5 install -y htop",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "cli",
      "monitoring"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 170,
    "category": "development"
  },
  {
    "id": "uv",
    "label": "Install uv",
    "description": "Fast Python package and project manager.",
    "command": "sudo dnf5 install -y uv",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "python",
      "dev"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 180,
    "category": "development"
  },
  {
    "id": "fwupd",
    "label": "Install fwupd",
    "description": "Firmware update daemon for supported hardware.",
    "command": "sudo dnf5 install -y fwupd",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "hardware",
      "firmware"
    ],
    "status": "optional",
    "impact": "low",
    "install_order": 190,
    "category": "development"
  },
  {
    "id": "podman",
    "label": "Install Podman",
    "description": "Daemonless container engine (recommended over Docker).",
    "command": "sudo dnf5 install -y podman podman-compose",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [
      "any"
    ],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "containers",
      "podman"
    ],
    "status": "recommended",
    "impact": "medium",
    "install_order": 200,
    "category": "development"
  },
  {
    "id": "distrobox",
    "label": "Install Distrobox",
    "description": "Run any Linux distribution in a container.",
    "command": "sudo dnf5 install -y distrobox",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [
      "podman"
    ],
    "conflicts_with": [],
    "tags": [
      "containers",
      "distrobox"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 210,
    "category": "development"
  },
  {
    "id": "snapper",
    "label": "Install Snapper",
    "description": "Btrfs snapshot management (requires Btrfs root).",
    "command": "sudo dnf5 install -y snapper",
    "requires_sudo": true,
    "tested_fedora": [
      "43",
      "44"
    ],
    "supported_fedora": [
      "43",
      "44"
    ],
    "desktops": "any",
    "arch": "any",
    "recommended_on": [],
    "kind": "rpm",
    "packages": [],
    "depends_on": [],
    "conflicts_with": [],
    "tags": [
      "backup",
      "btrfs"
    ],
    "status": "optional",
    "impact": "medium",
    "install_order": 220,
    "category": "development"
  }
];
