# SPEC_00: Project Overview

## Goal
The Fedora Automation Tool is a static web app that helps users generate a custom Fedora workstation setup script.

## Core idea
- The user selects packages and system changes
- The app turns them into a Bash script
- The script runs locally on Fedora without a backend or database

## Architecture
- Config: YAML definitions in `config/*.yaml`
- Build: Python validation and JSON generation in `build/`
- Frontend: static HTML/CSS/JS in `web/`
- Deployment: GitHub Pages and GitHub Actions

## Target users
- Fedora newcomers
- Developers who want a repeatable workstation setup
- Systems administrators who want simple automation

## Success criteria
- 30+ configurable items across categories
- Valid YAML definitions
- Script generation under one second
- Downloadable Bash output
- CI validation on push
