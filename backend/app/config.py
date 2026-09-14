"""Local configuration loaded before application services are imported."""
import os
from pathlib import Path

# Tiny dependency-free loader for the local backend/.env file.
for line in (Path(__file__).resolve().parents[1] / ".env").read_text(encoding="utf-8").splitlines() if (Path(__file__).resolve().parents[1] / ".env").exists() else []:
    if "=" in line and not line.lstrip().startswith("#"):
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())
