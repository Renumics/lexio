"""Check that release metadata agrees before building or publishing (Python 3.11+)."""

import ast
import json
import os
from pathlib import Path
import sys
import tomllib


def main():
    root = Path(__file__).resolve().parents[2]
    package = json.loads((root / "lexio/package.json").read_text())
    project = tomllib.loads((root / "python/lexio/pyproject.toml").read_text())
    versions = {
        "lexio/package.json": package["version"],
        "python/lexio/pyproject.toml": project["project"]["version"],
    }
    for lock_path in ("python/lexio/uv.lock", "examples/langchain/backend/uv.lock"):
        lock = tomllib.loads((root / lock_path).read_text())
        versions[lock_path] = next(
            (entry["version"] for entry in lock["package"] if entry["name"] == "lexio"),
            "missing",
        )

    version_file = root / "python/lexio/lexio/_version.py"
    assignments = {}
    for statement in ast.parse(version_file.read_text()).body:
        if isinstance(statement, ast.Assign):
            for target in statement.targets:
                if isinstance(target, ast.Name):
                    assignments[target.id] = ast.literal_eval(statement.value)
    versions["python/lexio/lexio/_version.py"] = assignments["__version__"]

    ref = os.environ.get("GITHUB_REF", "")
    expected = ref.removeprefix("refs/tags/v") if ref.startswith("refs/tags/v") else package["version"]
    errors = [
        f"{path}: expected {expected}, found {version}"
        for path, version in versions.items()
        if version != expected
    ]
    expected_tuple = tuple(int(part) if part.isdigit() else part for part in expected.replace("-", ".").split("."))
    if assignments["__version_tuple__"] != expected_tuple:
        errors.append(f"{version_file.relative_to(root)}: version tuple does not match {expected}")
    if errors:
        print("Release version mismatch:\n" + "\n".join(errors), file=sys.stderr)
        return 1
    print(f"All package versions match {expected}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
