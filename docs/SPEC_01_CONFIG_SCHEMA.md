# SPEC_01: Config Schema

## Overview
The source of truth lives in YAML files under `config/`.

## File layout
- `metadata.yaml` contains global app metadata
- `dnf.yaml` contains DNF and repo operations
- `multimedia.yaml` contains audio/video and codec choices
- `development.yaml` contains tools for coding and automation
- `tweaks.yaml` contains system tuning and productivity changes

## Required item fields
Each item in a category needs:
- `id`
- `label`
- `description`
- `command`
- `requires_sudo`
- `tested_fedora`
- `depends_on`
- `conflicts_with`
- `tags`
- `status`
- `impact`
- `install_order`

## Example
```yaml
- id: ffmpeg
  label: Install FFmpeg
  description: Add FFmpeg for conversion and streaming.
  command: sudo dnf install -y ffmpeg
  requires_sudo: true
  tested_fedora: ["39", "40", "41"]
  depends_on: ["rpmfusion-free"]
  conflicts_with: []
  tags: ["media", "codec"]
  status: recommended
  impact: medium
  install_order: 20
```

## Validation rules
- IDs must be unique
- `tested_fedora` must be a non-empty list of numeric versions
- Commands should be shell-safe and nonempty
- `status` must be `recommended` or `optional`
- `impact` must be `low`, `medium`, or `high`
