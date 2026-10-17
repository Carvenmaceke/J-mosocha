"""Rebuild gallery.html from index.html.

The gallery page is the same file as the home page with data-page="gallery" on <html>,
which shows only the gallery. Run this after every change to index.html:

    python3 tools/make-gallery-page.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
swaps = [
    ('<html lang="en-ZA" data-theme="light">', '<html lang="en-ZA" data-theme="light" data-page="gallery">'),
    ("<title>J Masocha Photography</title>", "<title>Gallery – J Masocha Photography</title>"),
]
for old, new in swaps:
    if old not in html:
        raise SystemExit("index.html changed: can't find " + old)
    html = html.replace(old, new, 1)
html = html.replace("<!doctype html>", "<!doctype html>\n<!-- Generated from index.html by tools/make-gallery-page.py. Edit index.html, not this file. -->", 1)
(root / "gallery.html").write_text(html, encoding="utf-8")
print("gallery.html updated")
