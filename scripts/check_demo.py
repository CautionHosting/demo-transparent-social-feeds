#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "Procfile",
    ROOT / "Containerfile",
    ROOT / "README.md",
    ROOT / "public" / "index.html",
    ROOT / "public" / "styles.css",
    ROOT / "public" / "app.js",
]
missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]
if missing:
    print("Missing required files:", ", ".join(missing), file=sys.stderr)
    sys.exit(1)

procfile = (ROOT / "Procfile").read_text()
if "0.0.0.0:8083" not in procfile or "e2e: true" not in procfile:
    print("Procfile must bind to 0.0.0.0:8083 and enable e2e: true", file=sys.stderr)
    sys.exit(1)

containerfile = (ROOT / "Containerfile").read_text()
if "@sha256:" not in containerfile or "ENTRYPOINT []" not in containerfile or "EXPOSE 8083" not in containerfile:
    print("Containerfile must pin the base image, clear ENTRYPOINT, and expose 8083", file=sys.stderr)
    sys.exit(1)

html = (ROOT / "public" / "index.html").read_text()
for phrase in ["Verifiable social algorithms", "synthetic example", "Algorithm selector", "Inspect / debug"]:
    if phrase not in html:
        print(f"index.html missing expected copy: {phrase}", file=sys.stderr)
        sys.exit(1)

app = (ROOT / "public" / "app.js").read_text()
for key in ["balanced", "chronological", "popularity", "following", "topics"]:
    if not re.search(rf"\b{key}\s*:", app):
        print(f"app.js missing algorithm: {key}", file=sys.stderr)
        sys.exit(1)

post_count = len(re.findall(r"\bid:\s*\"p\d+\"", app))
if post_count < 7:
    print(f"Expected at least 7 synthetic posts, found {post_count}", file=sys.stderr)
    sys.exit(1)

for phrase in ["weights", "contributions", "plainEnglishReason", "score ="]:
    if phrase not in app:
        print(f"app.js missing transparency implementation marker: {phrase}", file=sys.stderr)
        sys.exit(1)

print("demo check passed: files, Caution conventions, algorithms, and transparency markers verified")
