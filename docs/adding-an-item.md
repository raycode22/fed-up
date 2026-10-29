# Adding an item

1. Add an entry to one of `config/*.yaml` following the schema in `docs/SPEC_01_CONFIG_SCHEMA.md`.
2. Required fields: id, label, description, command, requires_sudo, tested_fedora, depends_on, conflicts_with, tags, status, impact, install_order.
3. Optional: supported_fedora, desktops (any|gnome|kde), arch (any|x86_64|aarch64), requires_repos, secure_boot_note, source_url, verified_on (ISO date), kind (rpm|repo|setting|service|flatpak|remote-script), packages (list of RPM names), recommended_on (list of any|gnome|kde).
4. Verify the command in a clean `fedora:43`/`fedora:44` container before submitting. Use `dnf5 repoquery` / `dnf5 install --assumeno`.
5. Remote-script pipes (`curl | sh`) require `kind: remote-script`.
6. DNF4 flags (`--add-repo`, `--set-disabled`, `--save`) and `dnf-plugins-core` are rejected by the validator.