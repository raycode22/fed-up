# Fed-up catalog audit (Fedora 43/44, DNF5)

Verified in clean `podman run --rm fedora:43` / `fedora:44` containers using `dnf5 repoquery`, `dnf5 install --assumeno`, and `dnf5 config-manager`. Sources: https://fedoraproject.org/wiki/User_Guide_-_Managing_Software#Package_Search_and_Information and https://dnf.readthedocs.io/en/latest/command_ref.html

| id | package(s)/command | F43 | F44 | DNF5 | repo/dep | desktop | arch | Secure Boot | verdict |
|---|---|---|---|---|---|---|---|---|---|
| rpmfusion-free | rpmfusion-free-release rpm | OK | OK | OK | none | any | any | none | OK |
| rpmfusion-nonfree | rpmfusion-nonfree-release rpm | OK | OK | OK | rpmfusion-free | any | any | none | OK |
| fedora-copr | copr enable atim/onedrive, solopasha/... | MISS | MISS (404) | OK | none | any | any | none | REMOVE |
| faster-dnf | dnf-plugins-core + config-manager --setopt --save | OK pkg | OK pkg | BROKEN flags | none | any | any | none | FIX |
| exclude-fedora-updates-testing | config-manager --set-disabled | OK | OK | BROKEN flag | none | any | any | none | FIX |
| dnf-automatic | dnf5-plugin-automatic + timer | FIX name | FIX name | BROKEN name | none | any | any | none | FIX |
| gnome-tweaks | gnome-tweaks | OK | OK | OK | none | gnome | any | none | FIX(label) |
| gnome-extensions-app | gnome-extensions-app | OK | OK | OK | none | gnome | any | none | OK |
| firewall-default | firewall-cmd --permanent --add-service=ssh | OK | OK | OK | none | any | any | none | FIX (only enable firewalld) |
| timeshift | timeshift | OK | OK | OK | none | any | any | none | OK |
| flatpak | flatpak + remote-add flathub | OK | OK | OK | none | any | any | none | OK |
| google-chrome | config-manager --add-repo (broken URL) | MISS repo | MISS repo | BROKEN flag+URL | none | any | x86_64 | none | FIX |
| vlc | vlc | OK | OK | OK | rpmfusion-free | any | any | none | OK |
| ffmpeg | ffmpeg ffmpeg-devel | OK | OK | OK w/ --allowerasing | rpmfusion-free | any | any | none | FIX |
| gstreamer-plugins | gstreamer1-plugins-{base,good,bad,ugly} ... | PARTIAL | PARTIAL | OK | rpmfusion-free | any | any | none | FIX |
| steam | steam | OK | OK | OK | rpmfusion-nonfree | any | x86_64 | none | OK |
| obs-studio | obs-studio | OK | OK | OK | rpmfusion-free | any | any | none | OK |
| kde-multimedia | kdenlive dragonplayer elisa-player | PARTIAL | PARTIAL | OK | rpmfusion-free | kde | any | none | FIX |
| spotify | negativo17 repo + spotify-client | repo OK | repo OK | BROKEN flag | rpmfusion-free | any | any | none | FIX |
| libreoffice | libreoffice | OK | OK | OK | none | any | any | none | OK |
| adobe-reader (Evince) | evince | OK | OK | OK | none | any | any | none | OK |
| handbrake | handbrake | OK | OK | OK | rpmfusion-free | any | any | none | OK |
| git | git | OK | OK | OK | none | any | any | none | OK |
| gh | gh | OK | OK | OK | git | any | any | none | OK |
| python-tools | python3 python3-pip python3-virtualenv python3-devel | OK | OK | OK | none | any | any | none | OK |
| nodejs | nodejs npm | MISS (versioned) | MISS (versioned) | OK | none | any | any | none | FIX |
| java-jdk | java-latest-openjdk-devel | OK | OK | OK | none | any | any | none | OK |
| rust | curl \| sh rustup | remote | remote | n/a | git | any | any | none | FIX (remote-script) |
| docker | docker docker-compose-plugin | MISS | MISS | OK | none | any | any | none | FIX (Podman recommended) |
| kubectl | kubectl | MISS (versioned) | MISS (versioned) | OK | none | any | any | none | FIX |
| ansible | ansible | OK | OK | OK | none | any | any | none | OK |
| terraform | terraform | MISS | MISS | OK | none | any | any | none | REMOVE |
| postgresql-client | postgresql | OK | OK | OK | none | any | any | none | OK |
| sqlite-tools | sqlite sqlite-tools | OK | OK | OK | none | any | any | none | OK |
| zsh | zsh + usermod | OK | OK | OK | none | any | any | none | OK |
| power-profiles-daemon | power-profiles-daemon | superseded | superseded | OK | none | any | any | none | REMOVE |
| tlp | tlp tlp-rdw | OK | OK | OK | conflicts power-profiles-daemon | any | any | none | FIX |
| ntfs-support | ntfs-3g | OK | OK | OK | none | any | any | none | OK |
| virtualbox | VirtualBox | OK (rpmfusion-nonfree) | OK (rpmfusion-nonfree) | OK | rpmfusion-nonfree | any | x86_64 | modules/Secure Boot | FIX |
| libreoffice-fonts | adobe-source-code-pro-fonts dejavu-fonts-all liberation-fonts | PARTIAL | PARTIAL | OK | none | any | any | none | OK->FIX |
| firewall-cockpit | cockpit + socket | OK | OK | OK | none | any | any | none | FIX(label) |
| criu | criu | OK | OK | OK | none | any | any | none | OK |
"