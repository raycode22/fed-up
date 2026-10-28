# Contributing

Thanks for helping improve the Fedora Automation Tool.

## Workflow

1. Fork the repository.
2. Create a feature branch.
3. Run the validator and tests locally.
4. Submit a pull request with a short summary.

## Local validation

```bash
python -m pip install -r requirements.txt
python build/build.py --validate --strict
python -m pytest build/tests.py
```
