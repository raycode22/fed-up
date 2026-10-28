# SPEC_02: Python Build Pipeline

## Responsibilities
The Python pipeline validates YAML and emits JSON used by the static frontend.

## Files
- `build/build.py`: CLI entry point
- `build/validator.py`: schema and validation logic
- `build/generator.py`: JSON generation logic
- `build/tests.py`: automated tests

## CLI behavior
```bash
python build/build.py --validate
python build/build.py --strict
python build/build.py
```

## Validation workflow
1. Load every YAML file in `config/`
2. Ignore `metadata.yaml` when collecting selectable items
3. Ensure each item has the required schema keys
4. Reject duplicate ids or invalid data
5. Emit a data payload if validation succeeds

## JSON output
The generator writes `web/data.json` with category labels and package metadata.
