import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from build.bootstrapper import build_bootstrapper


def test_bootstrapper_generates_and_contains_payload():
    with tempfile.TemporaryDirectory() as td:
        out = Path(td) / "install.sh"
        build_bootstrapper(str(out), str(ROOT / "fedup_tui"))
        assert out.exists()
        content = out.read_text()
        assert "Fed-up bootstrapper" in content
        assert "fedup_tui" in content
        assert os.access(out, os.X_OK)
