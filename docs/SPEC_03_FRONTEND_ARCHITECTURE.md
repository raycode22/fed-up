# SPEC_03: Frontend Architecture

## Stack
The front-end is intentionally simple:
- HTML5 structure
- CSS for layout and design
- Vanilla JavaScript for selection logic
- No framework dependencies

## Files
- `web/index.html` for layout
- `web/style.css` for styling
- `web/app.js` for interactive behavior
- `web/data.json` for generated configuration data

## User experience
- Category cards are displayed in a left column
- Each item has a checkbox and description
- The user selects packages
- The right column shows the generated script preview
- Download and copy actions produce a shell script
