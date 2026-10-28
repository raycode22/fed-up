# SPEC_06: Testing Strategy

## Levels
- YAML validation tests
- Schema checks
- Script generation checks
- Front-end smoke checks
- Manual Fedora verification

## Automated checks
The repository includes `build/tests.py` for validating the config and JSON output.

## Example command
```bash
python3 -m pytest build/tests.py -q
```

## Manual QA checklist
- Select several packages
- Generate script
- Run `bash -n` against the output
- Verify the script syntax and commands are clean
