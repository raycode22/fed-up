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
  { id: 'flathub-replace', label: 'Add Flathub Remote', section: 'system-config', installMethod: 'flatpak', command: 'flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['flatpak'] },
  { id: 'ssh', label: 'Install and Enable SSH', section: 'system-config', installMethod: 'service', command: 'sudo dnf5 install -y openssh-server && sudo systemctl enable --now sshd', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['ssh'] },
  { id: 'firmware-update', label: 'Update Firmware', section: 'system-config', installMethod: 'system', command: 'sudo fwupdmgr refresh && sudo fwupdmgr update -y', revertible: false, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['firmware'] },
  { id: 'rpmfusion-repos', label: 'RPM Fusion Repositories', section: 'system-config', installMethod: 'repo', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['repo'] },
  { id: 'multimedia-codecs', label: 'Multimedia Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y gstreamer1-plugins-{bad-*,good-*,base} gstreamer1-plugin-openh264 gstreamer1-libav --exclude=gstreamer1-plugins-bad-free-devel', revertible: true, requiresInput: null, needsVerification: false, depends_on: ['rpmfusion-repos'], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'intel-codecs', label: 'Intel Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y intel-media-va-driver', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['amd-codecs'], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'amd-codecs', label: 'AMD Codecs', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y mesa-va-drivers mesa-vdpau-drivers', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['intel-codecs'], desktops: 'any', supported_fedora: [], tags: ['codecs'] },
  { id: 'virtualization', label: 'Virtualization Tools', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 group install -y "Virtualization"', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['virt'] },
  { id: 'power-settings', label: 'Power Settings', section: 'system-config', installMethod: 'config', command: '', revertible: true, requiresInput: { type: 'power-profile' }, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['power'] },
  { id: 'nodejs-npm', label: 'Node.js 22 + npm', section: 'system-config', installMethod: 'dnf', command: 'sudo dnf5 install -y nodejs22 nodejs22-npm', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['dev'] },
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
  { id: 'zen-browser', label: 'Zen Browser', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub app.zen_browser.zen', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['browser'] },
  { id: 'thunderbird', label: 'Thunderbird', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y thunderbird', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mail'] },
  { id: 'betterbird', label: 'Betterbird', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub eu.betterbird.Betterbird', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mail'] },
  { id: 'webappmanager', label: 'WebAppManager', section: 'internet-comm', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['webapp'] },
  { id: 'discord', label: 'Discord', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub com.discordapp.Discord', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'element', label: 'Element', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub im.riot.Riot', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'telegram-desktop', label: 'Telegram Desktop', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub org.telegram.desktop', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'signal-desktop', label: 'Signal Desktop', section: 'internet-comm', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'whatsie', label: 'Whatsie (unofficial WhatsApp client)', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub com.ktechpit.whatsie', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'tor', label: 'Tor', section: 'internet-comm', installMethod: 'dnf', command: 'sudo dnf5 install -y tor torbrowser-launcher', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['privacy'] },
  { id: 'simplex', label: 'SimpleX', section: 'internet-comm', installMethod: 'flatpak', command: 'flatpak install -y flathub chat.simplex.simplex', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['chat'] },
  { id: 'libreoffice', label: 'LibreOffice', section: 'office-prod', installMethod: 'dnf', command: 'sudo dnf5 install -y libreoffice', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'onlyoffice', label: 'OnlyOffice', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub org.onlyoffice.desktopeditors', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'wps-office', label: 'WPS Office', section: 'office-prod', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['office'] },
  { id: 'joplin', label: 'Joplin', section: 'office-prod', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'logseq', label: 'Logseq', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub com.logseq.Logseq', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'obsidian', label: 'Obsidian', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub md.obsidian.Obsidian', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['notes'] },
  { id: 'dialect', label: 'Dialect', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub app.drey.Dialect', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['translate'] },
  { id: 'decoder', label: 'Decoder', section: 'office-prod', installMethod: 'flatpak', command: 'flatpak install -y flathub com.belmoussaoui.Decoder', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['util'] },
  { id: 'bitwarden', label: 'Bitwarden', section: 'office-prod', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['password'] },
  { id: 'keepassxc', label: 'KeePassXC', section: 'office-prod', installMethod: 'dnf', command: 'sudo dnf5 install -y keepassxc', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['password'] },
  { id: 'vscode', label: 'Visual Studio Code', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['editor'] },
  { id: 'vscodium', label: 'VSCodium', section: 'coding-devops', installMethod: 'flatpak', command: 'flatpak install -y flathub com.vscodium.codium', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['editor'] },
  { id: 'github-desktop', label: 'GitHub Desktop', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['git'] },
  { id: 'ansible', label: 'Ansible', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y ansible', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['devops'] },
  { id: 'docker', label: 'Docker', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y docker-ce', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: ['podman'], desktops: 'any', supported_fedora: [], tags: ['containers'] },
  { id: 'podman', label: 'Podman', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y podman', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: ['docker'], desktops: 'any', supported_fedora: [], tags: ['containers'] },
  { id: 'tabby', label: 'Tabby', section: 'coding-devops', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'wave-terminal', label: 'Wave Terminal', section: 'coding-devops', installMethod: 'flatpak', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['terminal'] },
  { id: 'veracrypt', label: 'VeraCrypt', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['security'] },
  { id: 'zsh-omz', label: 'Zsh and Oh My Zsh', section: 'coding-devops', installMethod: 'dnf', command: 'sudo dnf5 install -y zsh', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['shell'] },
  { id: 'miniconda', label: 'Miniconda', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['python'] },
  { id: 'android-studio', label: 'Android Studio', section: 'coding-devops', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['mobile'] },
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
  { id: 'sly', label: 'Sly', section: 'media-graphics', installMethod: 'flatpak', command: 'flatpak install -y flathub page.kramo.Sly', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['media'] },
  { id: 'steam', label: 'Steam', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y steam', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'lutris', label: 'Lutris', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y lutris', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'heroic', label: 'Heroic Games Launcher', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub com.heroicgameslauncher.hgl', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'retroarch', label: 'RetroArch', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y retroarch', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'dolphin-emu', label: 'Dolphin', section: 'gaming-emulation', installMethod: 'dnf', command: 'sudo dnf5 install -y dolphin-emu', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'duckstation', label: 'DuckStation', section: 'gaming-emulation', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'ppsspp', label: 'PPSSPP', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub org.ppsspp.PPSSPP', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'pcsx2', label: 'PCSX2', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub net.pcsx2.PCSX2', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'melonds', label: 'melonDS', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub net.kuribo64.melonDS', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
  { id: 'xemu', label: 'xemu', section: 'gaming-emulation', installMethod: 'flatpak', command: 'flatpak install -y flathub app.xemu.xemu', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['emulation'] },
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
  { id: 'onionshare', label: 'OnionShare', section: 'file-sharing', installMethod: 'dnf', command: 'sudo dnf5 install -y onionshare', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['sharing'] },
  { id: 'warp', label: 'Warp (GNOME file transfer)', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub app.drey.Warp', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['sharing'] },
  { id: 'dropbox', label: 'Dropbox', section: 'file-sharing', installMethod: 'flatpak', command: 'flatpak install -y flathub com.dropbox.Client', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['cloud'] },
  { id: 'mission-center', label: 'Mission Center', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.missioncenter.MissionCenter', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['system'] },
  { id: 'flatseal', label: 'Flatseal', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.tchx84.Flatseal', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['flatpak'] },
  { id: 'extension-manager', label: 'Extension Manager', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.mattjakeman.ExtensionManager', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gnome'] },
  { id: 'bottles', label: 'Bottles', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.usebottles.bottles', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['wine'] },
  { id: 'protontricks', label: 'Protontricks', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub com.github.Matoking.protontricks', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['wine'] },
  { id: 'protonup-qt', label: 'ProtonUp-Qt', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub net.davidotek.pupgui2', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['gaming'] },
  { id: 'gear-lever', label: 'Gear Lever', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub it.mijorus.gearlever', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['appimage'] },
  { id: 'peazip', label: 'PeaZip', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.github.peazip.PeaZip', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['archive'] },
  { id: 'deja-dup', label: 'Deja Dup', section: 'system-tools', installMethod: 'dnf', command: 'sudo dnf5 install -y deja-dup', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['backup'] },
  { id: 'pika-backup', label: 'Pika Backup', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub org.gnome.World.PikaBackup', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['backup'] },
  { id: 'netpeek', label: 'NetPeek', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub io.github.zingytomato.netpeek', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['network'] },
  { id: 'qpdf-tools', label: 'Qpdf Tools', section: 'system-tools', installMethod: 'flatpak', command: 'flatpak install -y flathub br.eng.silas.qpdftools', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['pdf'] },
  { id: 'microsoft-fonts', label: 'Microsoft Fonts', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'google-fonts', label: 'Google Noto Fonts', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y google-noto-fonts-all', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'adobe-fonts', label: 'Adobe Fonts', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'tela-icon-theme', label: 'Tela Icon Theme', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'qogir-icon-theme', label: 'Qogir Icon Theme', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'papirus-icon-theme', label: 'Papirus Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y papirus-icon-theme', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'numix-icon-theme', label: 'Numix Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y numix-icon-theme', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'numix-circle-icon-theme', label: 'Numix Circle Icon Theme', section: 'customization', installMethod: 'dnf', command: 'sudo dnf5 install -y numix-icon-theme-circle', revertible: true, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['theme'] },
  { id: 'nerd-fonts', label: 'Nerd Fonts', section: 'customization', installMethod: 'vendor', command: '', revertible: true, requiresInput: null, needsVerification: true, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['fonts'] },
  { id: 'system-cleanup', label: 'System Cleanup', section: 'system-cleanup', installMethod: 'cleanup', command: 'sudo dnf5 clean all && sudo dnf5 autoremove -y && flatpak uninstall --unused -y', revertible: false, requiresInput: null, needsVerification: false, depends_on: [], conflicts_with: [], desktops: 'any', supported_fedora: [], tags: ['cleanup'] },
];

const CRITICAL_ITEMS = new Set([
  'set-hostname', 'ssh', 'firmware-update', 'wake-on-lan',
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
  'whatsie', 'netpeek', 'onionshare',
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
  whatsie: 'An unofficial third-party WhatsApp Web client; review its code and account/privacy implications.',
  netpeek: 'Scans networks using Nmap; scan only networks you are authorized to assess.',
  onionshare: 'Shares selected files through a Tor onion service; review the files and sharing session before starting.',
  unrar: 'Installs a proprietary archive utility with license restrictions.',
  'wps-office': 'Installs proprietary office software subject to WPS licensing and service terms.',
};
const ITEM_DESCRIPTIONS = {
  'set-hostname': 'Set the network-visible hostname for this Fedora computer.',
  'configure-dnf': 'Enable the selected DNF performance defaults.',
  'dnf-autoupdate': 'Install the DNF5 Automatic plugin and enable its scheduled timer. Fedora defaults to downloading updates without installing them.',
  'flathub-replace': 'Add Flathub as an additional Flatpak source without removing Fedora remotes.',
  ssh: 'Install the OpenSSH server and enable the sshd service.',
  'firmware-update': 'Check for and install available device firmware updates.',
  'rpmfusion-repos': 'Add RPM Fusion free and nonfree package repositories.',
  'multimedia-codecs': 'Install multimedia playback and codec packages.',
  'intel-codecs': 'Install Intel media acceleration support.',
  'amd-codecs': 'Install AMD media acceleration support.',
  virtualization: 'Install Fedora virtualization packages.',
  'power-settings': 'Choose the active system power profile.',
  'nodejs-npm': 'Install Fedora 44 packages for Node.js 22 and npm.',
  'flatpak-update': 'Update installed Flatpak applications.',
  'wake-on-lan': 'Enable Wake-on-LAN for a selected network interface.',
  'system-cleanup': 'Cleans up your system from unnecessary files.',
  'google-fonts': 'Install the Fedora-packaged Google Noto font collection; this is not the complete Google Fonts catalog.',
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
  flatpak: 'Flathub distribution (vendor maintenance varies)',
  repo: 'RPM Fusion (third-party repository)',
  vendor: 'Vendor source; must be verified',
  pip: 'Python package index; must be verified',
  service: 'Fedora package repositories and systemd',
  config: 'Local system configuration',
  system: 'Firmware service',
  cleanup: 'Fedora DNF package manager',
};
const INSTALLATION_INFO = {
  'flathub-replace': {
    source: 'Flathub official remote; Fedora remote is preserved',
    note: 'Adds Flathub as an additional user remote; it does not replace Fedora’s Flatpak source.',
    docs: [['Flathub setup', 'https://flathub.org/setup']],
  },
  'nodejs-npm': {
    source: 'Fedora 44 packages: nodejs22 and nodejs22-npm',
    docs: [
      ['Fedora nodejs22 package', 'https://packages.fedoraproject.org/pkgs/nodejs22/nodejs22/'],
      ['Fedora nodejs22-npm package', 'https://packages.fedoraproject.org/pkgs/nodejs22/nodejs22-npm/'],
    ],
  },
  'google-fonts': {
    source: 'Fedora package google-noto-fonts-all (Google Noto family collection)',
    note: 'This installs Google Noto fonts only, not the complete Google Fonts catalog.',
    docs: [['Fedora google-noto-fonts-all package', 'https://packages.fedoraproject.org/pkgs/google-noto-fonts/google-noto-fonts-all/']],
  },
  'numix-icon-theme': {
    source: 'Fedora 44 package numix-icon-theme',
    note: 'Fedora lists this package, but its maintainer is orphaned.',
    docs: [['Fedora Numix Icon Theme package', 'https://packages.fedoraproject.org/pkgs/numix-icon-theme/numix-icon-theme/']],
  },
  'numix-circle-icon-theme': {
    source: 'Fedora 44 package numix-icon-theme-circle',
    note: 'Fedora lists this package, but its maintainer is orphaned.',
    docs: [['Fedora Numix Circle package', 'https://packages.fedoraproject.org/pkgs/numix-icon-theme-circle/numix-icon-theme-circle/']],
  },
  retroarch: {
    source: 'Fedora 44 package retroarch',
    docs: [['Fedora RetroArch package', 'https://packages.fedoraproject.org/pkgs/retroarch/retroarch/']],
  },
  'dolphin-emu': {
    source: 'Fedora 44 package dolphin-emu',
    docs: [['Fedora Dolphin package', 'https://packages.fedoraproject.org/pkgs/dolphin-emu/dolphin-emu/']],
  },
  onionshare: {
    source: 'Fedora 44 package onionshare',
    note: 'Shares selected files through a Tor onion service; review the files and sharing session before starting.',
    docs: [['Fedora OnionShare package', 'https://packages.fedoraproject.org/pkgs/onionshare/onionshare/']],
  },
  'google-chrome': {
    source: 'Google official Linux RPM',
    note: 'Verified vendor RPM route; download from Google and review the package before installing. Not enabled for unattended generation.',
    docs: [['Chrome Linux requirements and download', 'https://support.google.com/chrome/a/answer/9025903?hl=en']],
  },
  brave: {
    source: 'Brave official Fedora DNF repository',
    note: 'Fedora 41+ instructions are verified. Repository setup and trust prompts remain manual; this action does not configure a vendor repository automatically.',
    docs: [['Brave Linux installation', 'https://brave.com/linux/']],
  },
  vivaldi: {
    source: 'Vivaldi official RPM download',
    note: 'Vendor instructions use --nogpgcheck for the initial RPM installation. Kept manual rather than hiding that trust exception in an unattended action.',
    docs: [['Vivaldi RPM instructions', 'https://help.vivaldi.com/desktop/install-update/manual-setup-vivaldi-linux-repositories/']],
  },
  'microsoft-edge': {
    source: 'Microsoft RPM repository (GPG checks disabled in its repository config)',
    note: 'The published repository config sets gpgcheck=0 and repo_gpgcheck=0; not enabled for scripted installation.',
    docs: [['Microsoft Edge Linux download', 'https://www.microsoft.com/en-us/edge/download?platform=linux']],
  },
  opera: {
    source: 'Opera official Linux download page',
    note: 'Linux download is verified, but the official page did not confirm a Fedora RPM/package procedure. Do not guess a package or repository.',
    docs: [['Opera downloads', 'https://www.opera.com/download']],
  },
  webappmanager: {
    source: 'Linux Mint upstream project; no Fedora/Flathub install route verified',
    note: 'This is Linux Mint’s WebApp Manager. No supported Fedora package or official Flathub route was verified.',
    docs: [['Linux Mint WebApp Manager source', 'https://github.com/linuxmint/webapp-manager']],
  },
  'signal-desktop': {
    source: 'Signal official Linux AppImage',
    note: 'Signal’s official Linux route is an AppImage with detached-signature verification; the Debian apt instructions do not apply to Fedora.',
    docs: [['Signal Linux download and signature verification', 'https://signal.org/download/linux/']],
  },
  'wps-office': {
    source: 'WPS official Linux page; community Flatpak is stale',
    note: 'The Flathub listing exists but its available release metadata is old; no current vendor-maintained Fedora installation procedure was verified.',
    docs: [['WPS Office Linux download', 'https://www.wps.com/office/linux/']],
  },
  joplin: {
    source: 'Joplin official Linux AppImage',
    note: 'The official route is the Linux AppImage. The upstream install script pipes remote content to a shell, so this generated installer does not run it.',
    docs: [['Joplin installation', 'https://joplinapp.org/help/install/']],
  },
  logseq: {
    source: 'Logseq upstream Linux releases / community Flatpak',
    note: 'Upstream Linux release artifacts are available; Flatpak is community distributed, not Fedora-specific vendor support.',
    docs: [['Logseq official releases', 'https://github.com/logseq/logseq/releases']],
  },
  obsidian: {
    source: 'Obsidian official Linux AppImage; Flathub is community maintained',
    note: 'The vendor provides an AppImage. Obsidian identifies its Flathub package as community maintained.',
    docs: [['Obsidian downloads', 'https://obsidian.md/download']],
  },
  bitwarden: {
    source: 'Bitwarden official Linux RPM release',
    note: 'Download the RPM from Bitwarden’s official releases and verify its published SHA-256 digest; no Fedora-specific update repository was verified.',
    docs: [['Bitwarden downloads', 'https://bitwarden.com/download/']],
  },
  vscode: {
    source: 'Microsoft VS Code official RPM repository',
    note: 'Official Fedora/DNF instructions are verified; adding the signing key and repository is a separate step not performed by this package-only action.',
    docs: [['VS Code Linux setup', 'https://code.visualstudio.com/docs/setup/linux']],
  },
  'github-desktop': {
    source: 'No official Linux/Fedora installation route',
    note: 'GitHub Desktop is officially supported on Windows and macOS, not Linux. Linux forks and repackaging are unofficial.',
    docs: [['GitHub Desktop supported platforms', 'https://docs.github.com/en/desktop/installing-and-authenticating-to-github-desktop/installing-github-desktop']],
  },
  docker: {
    source: 'Docker official Fedora repository',
    note: 'Fedora 44 is listed by Docker. Repository setup is required, and Docker group membership grants root-equivalent privileges; this package-only action cannot safely configure it.',
    docs: [['Docker Engine on Fedora', 'https://docs.docker.com/engine/install/fedora/']],
  },
  tabby: {
    source: 'Tabby official Linux RPM releases',
    note: 'Use the RPM from the project’s official releases; Fedora 44 itself is not explicitly certified.',
    docs: [['Tabby releases', 'https://github.com/Eugeny/tabby/releases/latest']],
  },
  'wave-terminal': {
    source: 'Wave Terminal official Fedora/CentOS RPM',
    note: 'Vendor provides Fedora-class RPMs; manual download and package review are required.',
    docs: [['Wave Terminal downloads', 'https://www.waveterm.dev/download']],
  },
  veracrypt: {
    source: 'VeraCrypt official Linux AppImage',
    note: 'Generic Linux AppImage and PGP signature are available; verify the signature before running. No Fedora package route was verified.',
    docs: [['VeraCrypt downloads', 'https://veracrypt.io/en/Downloads.html']],
  },
  'zsh-omz': {
    source: 'Fedora zsh package; Oh My Zsh is a separate upstream shell script',
    note: 'Fedora 44 provides zsh. Oh My Zsh changes user shell configuration and requires its separate upstream installer, so this combined action remains manual.',
    docs: [['Fedora zsh package', 'https://packages.fedoraproject.org/pkgs/zsh/zsh/'], ['Oh My Zsh installation', 'https://github.com/ohmyzsh/ohmyzsh#basic-installation']],
  },
  miniconda: {
    source: 'Anaconda official Miniconda Linux installer',
    note: 'Generic Linux installer, not a Fedora package. Review Anaconda’s terms for commercial use.',
    docs: [['Miniconda install guide', 'https://www.anaconda.com/docs/getting-started/miniconda/install']],
  },
  'android-studio': {
    source: 'Google official Linux archive',
    note: 'Download the Linux archive and verify Google’s published SHA-256 checksum; no Fedora RPM was verified.',
    docs: [['Android Studio downloads and checksums', 'https://developer.android.com/studio#downloads'], ['Linux install guide', 'https://developer.android.com/studio/install']],
  },
  'hermes-agent': {
    source: 'NousResearch upstream Linux installer',
    note: 'Official installer runs downloaded shell code and provisions dependencies. Hermes has agent/tool access; inspect the installer and permissions before use.',
    docs: [['Hermes Agent installation', 'https://hermes-agent.nousresearch.com/docs/getting-started/installation']],
  },
  'claude-code': {
    source: 'Anthropic official Fedora/RHEL DNF repository',
    note: 'Fedora/RHEL route is documented. Confirm Anthropic’s signing-key fingerprint before adding the repository; account eligibility applies.',
    docs: [['Claude Code setup', 'https://code.claude.com/docs/en/setup']],
  },
  'codex-cli': {
    source: 'OpenAI official Linux installer / npm package',
    note: 'Generic Linux installation is documented; the installer downloads a binary. Coding agents can access local files and tools.',
    docs: [['Codex CLI documentation', 'https://developers.openai.com/codex/cli']],
  },
  opencode: {
    source: 'OpenCode official Linux installer / npm package',
    note: 'Official Linux instructions are available, but versions 1 and 2 can conflict; choose a version before installing.',
    docs: [['OpenCode installation docs', 'https://opencode.ai/docs/']],
  },
  'gemini-cli': {
    source: 'Google Gemini CLI npm package',
    note: 'Installation is available through npm, but Google’s transition notice changes consumer access; do not imply the former free consumer workflow remains available.',
    docs: [['Gemini CLI installation', 'https://geminicli.com/docs/get-started/installation/'], ['Google transition notice', 'https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/']],
  },
  'qwen-code': {
    source: 'Qwen Code upstream npm package / Linux installer',
    note: 'The npm route is more inspectable than piping the downloaded installer script to Bash; Node.js 22+ is required.',
    docs: [['Qwen Code official project', 'https://github.com/QwenLM/qwen-code']],
  },
  aider: {
    source: 'Aider official isolated Linux installer',
    note: 'The upstream installer uses uv and may provision Python; this action does not run a remote shell pipeline or install a global pip package.',
    docs: [['Aider installation', 'https://aider.chat/docs/install.html']],
  },
  goose: {
    source: 'Goose official Linux CLI installer',
    note: 'The official stable tag moves over time. Goose extensions can access tools; review permissions and pin a version for reproducibility.',
    docs: [['Goose installation', 'https://goose-docs.ai/docs/getting-started/installation']],
  },
  crush: {
    source: 'Charm official Fedora/RHEL package repository',
    note: 'Fedora/RHEL installation is documented with repository GPG checking enabled. Crush is an AI coding agent.',
    docs: [['Crush install instructions', 'https://github.com/charmbracelet/crush']],
  },
  'droid-cli': {
    source: 'Factory official Linux installer',
    note: 'Requires Factory sign-in and executes a vendor-hosted installer. Review account/data terms and agent access before using.',
    docs: [['Droid CLI quickstart', 'https://docs.factory.com/droid-cli/quickstart']],
  },
  amp: {
    source: 'Amp CLI docs; install instructions require workspace sign-in',
    note: 'A public generic Fedora install command could not be verified; do not invent one.',
    docs: [['Amp CLI documentation', 'https://ampcode.com/docs/cli']],
  },
  pi: {
    source: 'Pi official Linux installer',
    note: 'Generic Linux installer supports x86-64/ARM64 and requires Node.js 22.19 or newer. Review its dependency and update behavior.',
    docs: [['Pi documentation', 'https://pi.dev/docs/latest']],
  },
  'unsloth-studio': {
    source: 'Unsloth official Linux Studio installer',
    note: 'Generic Linux shell installer; Studio is beta and supports code execution. Follow upstream security guidance before exposing it to a network.',
    docs: [['Unsloth Linux install guide', 'https://unsloth.ai/docs/get-started/install/linux']],
  },
  duckstation: {
    source: 'DuckStation official Linux AppImage release',
    note: 'The official release provides a Linux AppImage; no current Fedora package or Flathub listing was verified.',
    docs: [['DuckStation official releases', 'https://github.com/stenzek/duckstation/releases']],
  },
  nomachine: {
    source: 'NoMachine official Linux RPM; Flathub package is client-only',
    note: 'Vendor Linux packages are available, but Fedora 44 support was not explicit. The Flathub Player package is not the host/server.',
    docs: [['NoMachine downloads', 'https://www.nomachine.com/download']],
  },
  anydesk: {
    source: 'AnyDesk official Linux download page',
    note: 'Use only the RPM/repository linked by AnyDesk; Fedora 44 support was not specifically confirmed. Remote-control access must be carefully restricted.',
    docs: [['AnyDesk Linux downloads', 'https://anydesk.com/en/downloads/linux']],
  },
  protonvpn: {
    source: 'Proton VPN official Fedora 44 repository',
    note: 'Official GUI/CLI support is for GNOME. The Flathub package is third-party maintained; confirm the vendor repository signing key.',
    docs: [['Proton VPN Fedora installation', 'https://protonvpn.com/support/official-linux-vpn-fedora/']],
  },
  mullvad: {
    source: 'Mullvad official RPM repository (Fedora 42+)',
    note: 'Fedora 44 is in the documented range; the installation method does not support Fedora Atomic Desktops.',
    docs: [['Mullvad Linux install guide', 'https://mullvad.net/en/help/install-mullvad-app-linux']],
  },
  zerotier: {
    source: 'ZeroTier official RPM repository/installer',
    note: 'Fedora is listed, but Fedora 44 is not named. Verify the vendor installer or signature rather than piping an unchecked script to a privileged shell.',
    docs: [['ZeroTier Linux instructions', 'https://www.zerotier.com/download/']],
  },
  tailscale: {
    source: 'Tailscale official Linux instructions and Fedora 44 package',
    note: 'Fedora 44 package is verified; prefer DNF package instructions over the vendor’s repository-configuring shell script.',
    docs: [['Tailscale Linux install', 'https://tailscale.com/docs/install/linux'], ['Fedora Tailscale package', 'https://packages.fedoraproject.org/pkgs/tailscale/tailscale/']],
  },
  netbird: {
    source: 'NetBird official Fedora 43+ repository',
    note: 'Fedora 44 is covered by the documented Fedora 43+ range. Desktop UI has GTK/WebKit requirements.',
    docs: [['NetBird Linux installation', 'https://docs.netbird.io/get-started/install/linux']],
  },
  'microsoft-fonts': {
    source: 'No official Microsoft/Fedora font installation route verified',
    note: 'No Fedora 44 package or Microsoft Linux install command was verified. Font redistribution is license-dependent.',
    docs: [['Microsoft font redistribution FAQ', 'https://learn.microsoft.com/en-us/typography/fonts/font-faq'], ['Fedora package search', 'https://packages.fedoraproject.org/search?query=msttcore']],
  },
  'adobe-fonts': {
    source: 'Adobe Fonts subscription service; Fedora/Linux desktop sync unsupported',
    note: 'Adobe’s supported Creative Cloud desktop platforms do not include Fedora/Linux. Do not represent third-party sync tools as Adobe-supported.',
    docs: [['Adobe Fonts', 'https://fonts.adobe.com/'], ['Creative Cloud requirements', 'https://helpx.adobe.com/download-install/apps/system-requirements/creative-cloud-requirements.html']],
  },
  'tela-icon-theme': {
    source: 'Tela upstream user-local shell installer',
    note: 'Upstream script installs to the user icon directory by default. Inspect it before running; no Fedora package was verified.',
    docs: [['Tela installation instructions', 'https://github.com/vinceliuice/Tela-icon-theme#installation']],
  },
  'qogir-icon-theme': {
    source: 'Qogir upstream user-local shell installer',
    note: 'Upstream script installs to the user icon directory by default. Inspect it before running; no Fedora package was verified.',
    docs: [['Qogir installation instructions', 'https://github.com/vinceliuice/Qogir-icon-theme#install']],
  },
  'nerd-fonts': {
    source: 'Nerd Fonts official release archives',
    note: 'Choose and install a specific family in the user font directory; no Fedora package or single safe “install all” action was verified. Check font licensing.',
    docs: [['Nerd Fonts official project', 'https://github.com/ryanoasis/nerd-fonts']],
  },
  netpeek: {
    source: 'NetPeek upstream Flathub package',
    note: 'The app requests network access and includes Nmap. Installation remains disabled in generated scripts; only scan networks you are authorized to assess.',
    docs: [['NetPeek upstream project', 'https://github.com/ZingyTomato/NetPeek']],
  },
};
const CUSTOM_ACTION_ITEMS = new Set([
  'set-hostname', 'configure-dnf', 'dnf-autoupdate', 'flathub-replace', 'ssh',
  'firmware-update', 'rpmfusion-repos', 'multimedia-codecs', 'intel-codecs',
  'amd-codecs', 'virtualization', 'power-settings', 'nodejs-npm',
  'flatpak-update', 'wake-on-lan', 'system-cleanup',
]);
for (const item of CATALOG_ITEMS) {
  if (item.id === 'system-cleanup') {
    item.description = ITEM_DESCRIPTIONS['system-cleanup'];
    item.command = 'sudo dnf5 clean all';
    item.revertible = false;
  }
  if (item.id === 'configure-dnf') item.revertible = false;
  const installationInfo = INSTALLATION_INFO[item.id];
  if (installationInfo) {
    item.installSource = installationInfo.source;
    item.verificationNote = installationInfo.note || '';
    item.installDocs = installationInfo.docs.map(([label, url]) => ({ label, url }));
  }
  if (item.id === 'flathub-replace') {
    item.description = 'Add Flathub alongside Fedora Flatpak remotes; no existing remote is removed.';
  }
  if (item.id === 'virtualization') item.revertible = false;
  if (item.id === 'zsh-omz') item.needsVerification = true;
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
  item.installSource ??= RPM_FUSION_PACKAGES.has(item.id)
    ? 'RPM Fusion (official third-party repository)'
    : SOURCE_BY_METHOD[item.installMethod] || 'Needs verification';
  if (item.installMethod === 'flatpak') {
    item.command = item.command.replace(/^flatpak install -y /, 'flatpak install ');
    const appMatch = item.command.match(/^flatpak install flathub ([A-Za-z0-9_.-]+)$/);
    if (appMatch) {
      item.installDocs ??= [];
      item.installDocs.unshift({
        label: `${item.label} on Flathub`,
        url: `https://flathub.org/apps/${appMatch[1]}`,
      });
    }
  }
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
  item.verificationNote ||= item.needsVerification
    ? 'The source is not confirmed or the verified installation route is not supported by this installer.'
    : '';
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
