# Contributing to Fed-up

## Adding an item
See `docs/adding-an-item.md`.

## Verification
- Run `python build/build.py --validate --strict`
- Run `python -m pytest build/tests.py`
- Run `node --test web/generator.test.js`
- Verify packages in a clean container: `podman run --rm fedora:44`.

## Deprecation policy
When a Fedora release goes EOL, a single change to `config/metadata.yaml` (`target_fedora_versions`) must flag every item that hasn't been re-verified via `verified_on`.