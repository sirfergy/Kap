#!/usr/bin/env python3
"""Check that latest-mac.yml describes exactly the artifacts being released."""

import base64
import hashlib
import re
import sys
from pathlib import Path


def sha512(path):
    digest = hashlib.sha512()
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(1 << 20), b""):
            digest.update(chunk)
    return base64.b64encode(digest.digest()).decode()


def main(dist, version):
    dist = Path(dist)
    text = (dist / "latest-mac.yml").read_text()
    if not re.search(rf"^version: {re.escape(version)}$", text, re.M):
        sys.exit(f"latest-mac.yml is not for version {version}")

    entries = re.findall(r"^  - url: (\S+)\n    sha512: (\S+)$", text, re.M)
    expected = {f"Kap-{version}-arm64-mac.zip", f"Kap-{version}-arm64.dmg"}
    if {url for url, _ in entries} != expected or len(entries) != len(expected):
        sys.exit(f"latest-mac.yml lists {sorted(url for url, _ in entries)}, expected {sorted(expected)}")

    for url, digest in entries:
        if sha512(dist / url) != digest:
            sys.exit(f"{url} does not match its sha512 in latest-mac.yml")

    print(f"latest-mac.yml matches {', '.join(sorted(expected))}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Usage: verify-update-metadata.py DIST_DIR VERSION")
    main(*sys.argv[1:])
