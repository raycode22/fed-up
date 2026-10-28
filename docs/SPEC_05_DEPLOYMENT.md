# SPEC_05: Deployment

## Hosting
The app is designed to be deployed on GitHub Pages.

## CI/CD
- GitHub Actions validates the YAML and runs tests on push or pull request
- A deploy workflow publishes the static web folder to Pages

## Configuration
- Set Pages source to the repository root or `web/` folder
- Ensure workflow has permission to upload Pages artifacts

## Local development
```bash
python3 -m pip install -r requirements.txt
python3 build/build.py
```
