export const SECTIONS = [
  { id: 'system-config', title: 'System Configuration', group: 'system', counter: false },
  { id: 'essential-apps', title: 'Essential Applications', group: 'essential', counter: true, expected: 16 },
  { id: 'internet-comm', title: 'Internet & Communication', group: 'additional', counter: true, expected: 19 },
  { id: 'office-prod', title: 'Office Productivity', group: 'additional', counter: true, expected: 10 },
  { id: 'coding-devops', title: 'Coding and DevOps', group: 'additional', counter: true, expected: 12 },
  { id: 'ai-coding', title: 'AI Coding Agents & Harnesses', group: 'additional', counter: true, expected: 13 },
  { id: 'media-graphics', title: 'Media & Graphics', group: 'additional', counter: true, expected: 12 },
  { id: 'gaming-emulation', title: 'Gaming & Emulation', group: 'additional', counter: true, expected: 11 },
  { id: 'remote-net', title: 'Remote Networking', group: 'additional', counter: true, expected: 9 },
  { id: 'file-sharing', title: 'File Sharing & Download', group: 'additional', counter: true, expected: 5 },
  { id: 'system-tools', title: 'System Tools', group: 'additional', counter: true, expected: 12 },
  { id: 'customization', title: 'Customization', group: 'additional', counter: true, expected: 9 },
  { id: 'system-cleanup', title: 'System Cleanup', group: 'system', counter: false },
];

export const CATALOG_ITEMS = [
  // System Configuration (no counter)
  { id: 'set-hostname', label: 'Set Hostname', section: 'system-config', installMethod: 'config', command: '', revertible: true, requiresInput: { type: 'hostname' }, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['system'] },
  { id: 'configure-dnf', label: 'Configure DNF', section: 'system-config', installMethod: 'config', command: 'sudo dnf5 config-manager setopt fastestmirror=True deltarpm=True', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['dnf'] },
  { id: 'dnf-autoupdate', label: 'Enable DNF Autoupdate', section: 'system-config', installMethod: 'service', command: 'sudo dnf5 install -y dnf5-plugin-automatic && sudo systemctl enable --now dnf-automatic.timer', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['dnf'] },
  { id: 'flathub-replace', label: 'Replace Fedora Flatpak Repo with Flathub', section: 'system-config', installMethod: 'flatpak', command: 'flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['flatpak'] },
  { id: 'ssh', label: 'Install and Enable SSH', section: 'system-config', installMethod: 'service', command: 'sudo dnf5 install -y openssh-server && sudo systemctl enable --now sshd', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ssh'] },
  { id: 'firmware-update', label: 'Update Firmware', section: 'system-config', installMethod: 'system', command: 'sudo fwupdmgr refresh && sudo fwupdmgr update -y', revertible: false, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['firmware'] },
  { id: 'rpmfusion-repos', label: 'RPM Fusion Repositories', section: 'system-config', installMethod: 'repo', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['repo'] },
  { id: 'multimedia-codecs', label: 'Multimedia Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y gstreamer1-plugins-{bad-*,good-*,base} gstreamer1-plugin-openh264 gstreamer1-libav --exclude=gstreamer1-plugins-bad-free-devel', revertible: true, requiresInput: null, needsVerification: false, depends_on: ['rpmfusion-repos'], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'intel-codecs', label: 'Intel Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y intel-media-va-driver', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['amd-codecs'], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'amd-codecs', label: 'AMD Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y mesa-va-drivers mesa-vdpau-drivers', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['intel-codecs'], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'virtualization', label: 'Virtualization Tools', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 group install -y "Virtualization"', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['virt'] },
  { id: 'power-settings', label: 'Power Settings', section: 'system-config', installMethod: 'config', command: '', revertible: true, requiresInput: { type: 'power-profile' }, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['power'] },
  { id: 'nodejs-npm', label: 'Node.js 22 + npm', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y nodejs npm', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['dev'] },
  { id: 'flatpak-update', label: 'Update Flatpak Applications', section: 'system-config', installMethod: 'flatpak', command: 'flatpak update -y', revertible: false, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['flatpak'] },
  { id: 'wake-on-lan', label: 'Enable Wake-on-LAN', section: 'system-config', installMethod: 'config', command: '', revertible: true, requiresInput: { type: 'interface' }, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['network'] },
  // Essential Applications (16)
  { id: 'mc', label: 'mc', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y mc', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'btop', label: 'btop', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y btop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'htop', label: 'htop', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y htop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'rsync', label: 'rsync', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y rsync', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'inxi', label: 'inxi', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y inxi', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'ncdu', label: 'ncdu', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y ncdu', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'tilix', label: 'tilix', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y tilix', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'tmux', label: 'tmux', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y tmux', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'fastfetch', label: 'fastfetch', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y fastfetch', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'unzip', label: 'unzip', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y unzip', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'unrar', label: 'unrar', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y unrar', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'git', label: 'git', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y git', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['dev'] },
  { id: 'wget', label: 'wget', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y wget', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'curl', label: 'curl', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y curl', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'gnome-tweaks', label: 'gnome-tweaks', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y gnome-tweaks', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'gnome', supported_fedora: [], tags: ['gnome'] },
  { id: 'syncthing', label: 'syncthing', section: 'essential-apps', installMethod: 'dnf', command: 'sudo dnf5 install -y syncthing', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['sync'] },
  { id: 'firefox', label: 'Firefox', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y firefox', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'google-chrome', label: 'Google Chrome', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'chromium', label: 'Chromium', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y chromium', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'brave', label: 'Brave', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'vivaldi', label: 'Vivaldi', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'microsoft-edge', label: 'Microsoft Edge', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'librewolf', label: 'LibreWolf', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub io.gitlab.librewolf-community', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'opera', label: 'Opera', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'zen-browser', label: 'Zen Browser', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'thunderbird', label: 'Thunderbird', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y thunderbird', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mail'] },
  { id: 'betterbird', label: 'Betterbird', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mail'] },
  { id: 'webappmanager', label: 'WebAppManager', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['webapp'] },
  { id: 'discord', label: 'Discord', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub com.discordapp.Discord', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'element', label: 'Element', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub im.riot.Riot', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'telegram-desktop', label: 'Telegram Desktop', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub org.telegram.desktop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'signal-desktop', label: 'Signal Desktop', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub org.signal.Signal', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'whatsie', label: 'Whatsie', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'tor', label: 'Tor', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y tor torbrowser-launcher', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['privacy'] },
  { id: 'simplex', label: 'SimpleX', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'libreoffice', label: 'LibreOffice', section: 'office-prod', installMethod: 'dnf', command: 'sudo dnf5 install -y libreoffice', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'onlyoffice', label: 'OnlyOffice', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub org.onlyoffice.desktopeditors', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'wps-office', label: 'WPS Office', section: 'office-prod', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'joplin', label: 'Joplin', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub net.cozic.joplin_desktop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'logseq', label: 'Logseq', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub com.logseq.Logseq', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'obsidian', label: 'Obsidian', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub md.obsidian.Obsidian', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'dialect', label: 'Dialect', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.gi_lom.dialect', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['translate'] },
  { id: 'decoder', label: 'Decoder', section: 'office-prod', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'bitwarden', label: 'Bitwarden', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub com.bitwarden.desktop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['password'] },
  { id: 'keepassxc', label: 'KeePassXC', section: 'office-prod', installMethod: 'dnf', command: 'sudo dnf5 install -y keepassxc', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['password'] },
  { id: 'vscode', label: 'Visual Studio Code', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['editor'] },
  { id: 'vscodium', label: 'VSCodium', section: 'coding-devops', installMethod: 'flatpak', command: 'flatpak install -y flathub com.vscodium.codium', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['editor'] },
  { id: 'github-desktop', label: 'GitHub Desktop', section: 'coding-devops', installMethod: 'flatpak', command: 'flatpak install -y flathub io.github.shiftey.Desktop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['git'] },
  { id: 'ansible', label: 'Ansible', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y ansible', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['devops'] },
  { id: 'docker', label: 'Docker', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y docker-ce', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: ['podman'], desktops: 'any', supported_fedora: [], tags: ['containers'] },
  { id: 'podman', label: 'Podman', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y podman', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['docker'], desktops: 'any', supported_fedora: [], tags: ['containers'] },
  { id: 'tabby', label: 'Tabby', section: 'coding-devops', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'wave-terminal', label: 'Wave Terminal', section: 'coding-devops', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'veracrypt', label: 'VeraCrypt', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['security'] },
  { id: 'zsh-omz', label: 'Zsh and Oh My Zsh', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y zsh', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['shell'] },
  { id: 'miniconda', label: 'Miniconda', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['python'] },
  { id: 'android-studio', label: 'Android Studio', section: 'coding-devops', installMethod: 'flatpak', command: 'flatpak install -y flathub com.google.AndroidStudio', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mobile'] },
  { id: 'hermes-agent', label: 'Hermes Agent', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'claude-code', label: 'Claude Code', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'codex-cli', label: 'Codex CLI', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'opencode', label: 'OpenCode', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'gemini-cli', label: 'Gemini CLI', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'qwen-code', label: 'Qwen Code', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'aider', label: 'Aider', section: 'ai-coding', installMethod: 'pip', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'goose', label: 'Goose', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'crush', label: 'Crush', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'droid-cli', label: 'Droid CLI', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'amp', label: 'Amp', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'pi', label: 'Pi', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'unsloth-studio', label: 'Unsloth Studio', section: 'ai-coding', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ai'] },
  { id: 'vlc', label: 'VLC', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y vlc', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'stremio', label: 'Stremio', section: 'media-graphics', installMethod: 'flatpak', command: 'flatpak install -y flathub com.stremio.Stremio', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'spotify', label: 'Spotify', section: 'media-graphics', installMethod: 'flatpak', command: 'flatpak install -y flathub com.spotify.Client', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'gimp', label: 'GIMP', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y gimp', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['graphics'] },
  { id: 'inkscape', label: 'Inkscape', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y inkscape', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['graphics'] },
  { id: 'krita', label: 'Krita', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y krita', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['graphics'] },
  { id: 'blender', label: 'Blender', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y blender', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['graphics'] },
  { id: 'obs-studio', label: 'OBS Studio', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y obs-studio', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['streaming'] },
  { id: 'kdenlive', label: 'Kdenlive', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y kdenlive', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['video'] },
  { id: 'freetube', label: 'FreeTube', section: 'media-graphics', installMethod: 'flatpak', command: 'flatpak install -y flathub io.freetubeapp.FreeTube', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'mpv', label: 'MPV', section: 'media-graphics', installMethod: 'dnf', command: 'sudo dnf5 install -y mpv', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'sly', label: 'Sly', section: 'media-graphics', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'steam', label: 'Steam', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y steam', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'lutris', label: 'Lutris', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y lutris', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'heroic', label: 'Heroic Games Launcher', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub com.heroicgameslauncher.hgl', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'retroarch', label: 'RetroArch', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.libretro.RetroArch', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'dolphin-emu', label: 'Dolphin', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.dolphinemu.dolphin-emu', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'duckstation', label: 'DuckStation', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.duckstation.DuckStation', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'ppsspp', label: 'PPSSPP', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.ppsspp.PPSSPP', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'pcsx2', label: 'PCSX2', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub net.pcsx2.PCSX2', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'melonds', label: 'melonDS', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub net.kuribo64.melonDS', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'xemu', label: 'xemu', section: 'gaming-emulation', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'prism-launcher', label: 'Prism Launcher', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.prismlauncher.PrismLauncher', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'remmina', label: 'Remmina', section: 'remote-net', installMethod: 'dnf', command: 'sudo dnf5 install -y remmina', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['remote'] },
  { id: 'nomachine', label: 'NoMachine', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['remote'] },
  { id: 'rustdesk', label: 'RustDesk', section: 'remote-net', installMethod: 'flatpak', command: 'flatpak install -y flathub com.rustdesk.RustDesk', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['remote'] },
  { id: 'anydesk', label: 'AnyDesk', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['remote'] },
  { id: 'protonvpn', label: 'Proton VPN', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['vpn'] },
  { id: 'mullvad', label: 'Mullvad VPN', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['vpn'] },
  { id: 'zerotier', label: 'ZeroTier', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['vpn'] },
  { id: 'tailscale', label: 'Tailscale', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['vpn'] },
  { id: 'netbird', label: 'NetBird', section: 'remote-net', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['vpn'] },
  { id: 'qbittorrent', label: 'qBittorrent', section: 'file-sharing', installMethod: 'dnf', command: 'sudo dnf5 install -y qbittorrent', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['torrent'] },
  { id: 'video-downloader', label: 'Video Downloader', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.unrud.VideoDownloader', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['download'] },
  { id: 'onionshare', label: 'OnionShare', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub org.onionshare.OnionShare', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['sharing'] },
  { id: 'warp', label: 'Warp', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub app.warp.Warp', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['sharing'] },
  { id: 'dropbox', label: 'Dropbox', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub com.dropbox.Client', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['cloud'] },
  { id: 'mission-center', label: 'Mission Center', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.missioncenter.MissionCenter', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['system'] },
  { id: 'flatseal', label: 'Flatseal', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.tchx84.Flatseal', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['flatpak'] },
  { id: 'extension-manager', label: 'Extension Manager', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.mattjakeman.ExtensionManager', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gnome'] },
  { id: 'bottles', label: 'Bottles', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.usebottles.bottles', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['wine'] },
  { id: 'protontricks', label: 'Protontricks', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.Matoking.protontricks', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['wine'] },
  { id: 'protonup-qt', label: 'ProtonUp-Qt', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub net.davidotek.pupgui2', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'gear-lever', label: 'Gear Lever', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub it.mijorus.gearlever', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['appimage'] },
  { id: 'peazip', label: 'PeaZip', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.github.peazip.PeaZip', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['archive'] },
  { id: 'deja-dup', label: 'Deja Dup', section: 'system-tools', installMethod: 'dnf', command: 'sudo dnf5 install -y deja-dup', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['backup'] },
  { id: 'pika-backup', label: 'Pika Backup', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub org.gnome.World.PikaBackup', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['backup'] },
  { id: 'netpeek', label: 'NetPeek', section: 'system-tools', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['network'] },
  { id: 'qpdf-tools', label: 'Qpdf Tools', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.github.qpdf.QpdfTools', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['pdf'] },
  { id: 'microsoft-fonts', label: 'Microsoft Fonts', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y msttcorefonts', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'google-fonts', label: 'Google Fonts', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y google-fonts', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'adobe-fonts', label: 'Adobe Fonts', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'tela-icon-theme', label: 'Tela Icon Theme', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'qogir-icon-theme', label: 'Qogir Icon Theme', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'papirus-icon-theme', label: 'Papirus Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y papirus-icon-theme', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'numix-icon-theme', label: 'Numix Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y numix-icon-theme', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'numix-circle-icon-theme', label: 'Numix Circle Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y numix-icon-theme-circle', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'nerd-fonts', label: 'Nerd Fonts', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'system-cleanup', label: 'System Cleanup', section: 'system-cleanup', installMethod: 'cleanup', command: 'sudo dnf5 clean all && sudo dnf5 autoremove -y && flatpak uninstall --unused -y', revertible: false, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['cleanup'] },
];

const CRITICAL_ITEMS = new Set([
  'set-hostname', 'flathub-replace', 'ssh', 'firmware-update', 'wake-on-lan',
  'veracrypt', 'nomachine', 'anydesk', 'rustdesk',
]);
const HIGH_CAUTION_ITEMS = new Set([
  'configure-dnf', 'dnf-autoupdate', 'rpmfusion-repos', 'power-settings',
  'virtualization', 'docker', 'zsh-omz',
]);
const CAUTION_ITEMS = new Set([
  'unrar', 'spotify', 'google-chrome', 'microsoft-edge', 'dropbox', 'wps-office',
  'microsoft-fonts', 'adobe-fonts', 'system-cleanup', 'vivaldi', 'opera',
  'discord', 'steam', 'obsidian', 'onlyoffice',
]);
const RISK_REASONS = {
  critical: 'This can change system identity, network exposure, firmware, or remove system-managed data.',
  high: 'This changes system configuration, enables a service, or adds a software source.',
  caution: 'This may involve proprietary licensing, large downloads, or software conflicts.',
  safe: 'This installs software from a configured distribution or Flathub source.',
};
const ITEM_RISK_REASONS = {
  'set-hostname': 'Changes the machine hostname that may be visible to local networks and services.',
  ssh: 'Enables a network-accessible SSH service that can expose the system if credentials or firewall rules are weak.',
  'firmware-update': 'Updates device firmware; interruption or an incompatible update can leave hardware unusable.',
  'wake-on-lan': 'Changes network adapter settings so this machine can be woken remotely.',
  'flathub-replace': "Would replace the existing Fedora Flatpak source and can change where applications receive updates.",
  veracrypt: 'Disk encryption changes can make data inaccessible if the configuration or recovery material is lost.',
  nomachine: 'Enables remote control of the computer and may expose it to unauthorized access.',
  anydesk: 'Enables remote control of the computer and may expose it to unauthorized access.',
  rustdesk: 'Enables remote control of the computer and may expose it to unauthorized access.',
  'configure-dnf': 'Changes DNF package-manager defaults.',
  'dnf-autoupdate': 'Enables scheduled DNF5 automatic updates. Fedora defaults to downloading updates without installing them.',
  'rpmfusion-repos': 'Adds third-party repositories and asks you to trust their package-signing keys.',
  'power-settings': 'Changes the active system power profile.',
  virtualization: 'Adds virtualization packages and system services.',
  docker: 'Adds container-management software that can grant elevated system access.',
  'zsh-omz': 'Changes shell configuration; an incorrect default-shell change can impair login access.',
  'system-cleanup': "Removes DNF's cached metadata and downloaded package files only; it does not remove installed software or user data.",
  'google-chrome': 'Installs proprietary browser software subject to Google licensing and update policies.',
  'microsoft-edge': 'Installs proprietary browser software subject to Microsoft licensing and update policies.',
  vivaldi: 'Installs proprietary browser software subject to Vivaldi licensing and update policies.',
  opera: 'Installs proprietary browser software subject to Opera licensing and update policies.',
  spotify: 'Installs proprietary media software subject to Spotify licensing and service terms.',
  discord: 'Installs proprietary communication software subject to Discord licensing and service terms.',
  steam: 'Installs proprietary gaming software and may download large game data.',
  obsidian: 'Installs proprietary note-taking software subject to its license and service terms.',
  dropbox: 'Installs proprietary cloud software that may synchronize selected files to Dropbox.',
  'microsoft-fonts': 'Installs fonts with vendor-specific license terms.',
  'adobe-fonts': 'Installs fonts with vendor-specific license terms.',
  unrar: 'Installs a proprietary archive utility with license restrictions.',
  'wps-office': 'Installs proprietary office software subject to WPS licensing and service terms.',
};
const ITEM_DESCRIPTIONS = {
  'set-hostname': 'Set the network-visible hostname for this Fedora computer.',
  'configure-dnf': 'Enable the selected DNF performance defaults.',
  'dnf-autoupdate': 'Install the DNF5 Automatic plugin and enable its scheduled timer. Fedora defaults to downloading updates without installing them.',
  'flathub-replace': 'Replace the Fedora Flatpak source with Flathub.',
  ssh: 'Install the OpenSSH server and enable the sshd service.',
  'firmware-update': 'Check for and install available device firmware updates.',
  'rpmfusion-repos': 'Add RPM Fusion free and nonfree package repositories.',
  'multimedia-codecs': 'Install multimedia playback and codec packages.',
  'intel-codecs': 'Install Intel media acceleration support.',
  'amd-codecs': 'Install AMD media acceleration support.',
  virtualization: 'Install Fedora virtualization packages.',
  'power-settings': 'Choose the active system power profile.',
  'nodejs-npm': 'Install Node.js and npm; the exact Node.js major version needs verification.',
  'flatpak-update': 'Update installed Flatpak applications.',
  'wake-on-lan': 'Enable Wake-on-LAN for a selected network interface.',
  'system-cleanup': 'Cleans up your system from unnecessary files.',
};
const REVERSIBLE_REASONS = {
  'set-hostname': 'The script records the previous static hostname and restores it on revert.',
  'dnf-autoupdate': 'The script records whether it installed the DNF5 Automatic plugin and enabled its timer.',
  'rpmfusion-repos': 'The script removes RPM Fusion release packages only if it installed them.',
  'power-settings': 'The script records and restores the previous power profile.',
  'wake-on-lan': 'The script records and restores the previous Wake-on-LAN setting for the selected connection.',
};
const IRREVERSIBLE_REASONS = {
  'configure-dnf': 'Changes DNF settings without recording their previous values.',
  'firmware-update': 'Firmware updates change device firmware and cannot be rolled back reliably.',
  virtualization: 'Installs a package group without recording all packages added by the group.',
  'flatpak-update': 'Updates installed Flatpak applications; previous application versions may not be available.',
  'system-cleanup': 'Removes cached DNF metadata and downloaded package files that cannot be restored.',
};
const RPM_FUSION_PACKAGES = new Set(['unrar', 'vlc', 'steam']);
const SOURCE_BY_METHOD = {
  dnf: 'Fedora package repositories',
  flatpak: 'Flathub (requires the Flathub remote)',
  repo: 'RPM Fusion (third-party repository)',
  vendor: 'Vendor source; must be verified',
  pip: 'Python package index; must be verified',
  service: 'Fedora package repositories and systemd',
  config: 'Local system configuration',
  system: 'Firmware service',
  cleanup: 'Fedora DNF package manager',
};
const CUSTOM_ACTION_ITEMS = new Set([
  'set-hostname', 'configure-dnf', 'dnf-autoupdate', 'flathub-replace', 'ssh',
  'firmware-update', 'rpmfusion-repos', 'multimedia-codecs', 'intel-codecs',
  'amd-codecs', 'virtualization', 'power-settings', 'nodejs-npm',
  'flatpak-update', 'wake-on-lan', 'system-cleanup',
]);
const VERIFIED_FLATPAK_IDS = new Set(['flatpak-update', 'flathub-replace']);

for (const item of CATALOG_ITEMS) {
  if (item.id === 'system-cleanup') {
    item.description = ITEM_DESCRIPTIONS['system-cleanup'];
    item.command = 'sudo dnf5 clean all';
    item.revertible = false;
  }
  if (item.id === 'configure-dnf') item.revertible = false;
  if (item.id === 'flathub-replace') {
    item.description = "Replacing Fedora's Flatpak remote cannot be safely reversed without verifying the prior remote configuration.";
    item.needsVerification = true;
    item.revertible = false;
  }
  if (item.id === 'virtualization') item.revertible = false;
  if (item.id === 'nodejs-npm') item.needsVerification = true;
  if (item.id === 'zsh-omz') item.needsVerification = true;
  if (item.installMethod === 'flatpak' && !VERIFIED_FLATPAK_IDS.has(item.id)) {
    item.needsVerification = true;
  }
  item.risk = CRITICAL_ITEMS.has(item.id)
    ? 'critical'
    : HIGH_CAUTION_ITEMS.has(item.id)
      ? 'high'
      : CAUTION_ITEMS.has(item.id)
        ? 'caution'
        : 'safe';
  item.riskReason = item.risk === 'safe'
    ? RISK_REASONS.safe
    : RISK_REASONS[item.risk];
  item.riskReason = ITEM_RISK_REASONS[item.id] || item.riskReason;
  item.desktopApplicability = item.desktops === 'any' ? ['gnome', 'kde'] : [item.desktops];
  if (RPM_FUSION_PACKAGES.has(item.id) && !item.depends_on.includes('rpmfusion-repos')) {
    item.depends_on.push('rpmfusion-repos');
  }
  item.recommendedFor = [];
  item.supportedVersions = ['41', '42', '43', '44'];
  item.installSource = RPM_FUSION_PACKAGES.has(item.id)
    ? 'RPM Fusion (official third-party repository)'
    : SOURCE_BY_METHOD[item.installMethod] || 'Needs verification';
  item.description ??= ITEM_DESCRIPTIONS[item.id] || `Install ${item.label} from ${item.installSource}.`;
  item.installCommands = item.needsVerification || !item.command ? [] : [item.command];
  item.revertCommands = item.revertible
    ? ['Remove only packages and repositories recorded as installed by this script; restore captured system values.']
    : 'not reversible';
  item.revertReason = item.revertible
    ? REVERSIBLE_REASONS[item.id] || 'The script records package changes and removes only packages it installed.'
    : IRREVERSIBLE_REASONS[item.id] || 'This operation changes existing state or removes data that cannot be reliably restored.';
  item.requirements = [
    ...(item.installMethod === 'flatpak' ? ['flatpak', 'Flathub remote'] : []),
    ...item.depends_on,
  ];
  item.licenseNotes = item.risk === 'caution' ? 'Review the upstream software license and terms.' : '';
  if (item.needsVerification || (!item.command && !CUSTOM_ACTION_ITEMS.has(item.id))) item.needsVerification = true;
}

const COMMON_RECOMMENDATIONS = new Set([
  'configure-dnf', 'dnf-autoupdate', 'rpmfusion-repos', 'multimedia-codecs',
  'flatpak-update', 'flathub-replace', 'git', 'curl', 'wget', 'htop', 'btop',
  'fastfetch', 'rsync', 'unzip', 'tmux',
]);
for (const item of CATALOG_ITEMS) {
  if (COMMON_RECOMMENDATIONS.has(item.id)) item.recommendedFor = ['gnome', 'kde'];
  if (item.id === 'gnome-tweaks' || item.id === 'flatseal' || item.id === 'extension-manager') {
    item.recommendedFor = ['gnome'];
  }
  if (item.id === 'kde-addons') item.recommendedFor = ['kde'];
  if (item.id === 'gnome-tweaks' || item.id === 'extension-manager') {
    item.notApplicableNote = 'Not applicable to KDE Plasma.';
  }
}
