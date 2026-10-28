# Architecture overview

The project is split into three layers:

- `config/`: source-of-truth YAML data describing packages and customizations.
- `build/`: Python validation and JSON generation logic.
- `web/`: static front-end consumed by GitHub Pages.

This keeps the app simple, auditable and cheap to host.
