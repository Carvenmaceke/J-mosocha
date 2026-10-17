"""Rebuild gallery.html from index.html.

The gallery page is the same file as the home page with data-page="gallery" on <html>,
which shows only the gallery. Run this after every change to index.html:

    python3 tools/make-gallery-page.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
HOME_TITLE = "J Masocha Photography | Photographer in Pretoria Central"
HOME_DESC = "Photography, videography and printing studio in Pretoria Central since 2010. Kids, birthday, cake smash, maternity, graduation, couples, family and corporate photoshoots."
GALLERY_DESC = "See our studio work in Pretoria: birthday, cake smash, babies, maternity, graduation, couples, family and portrait photoshoots by J Masocha Photography."
html = (root / "index.html").read_text(encoding="utf-8")
swaps = [
    ('<html lang="en-ZA" data-theme="light">', '<html lang="en-ZA" data-theme="light" data-page="gallery">'),
    ("<title>%s</title>" % HOME_TITLE, "<title>Gallery | J Masocha Photography, Pretoria</title>"),
    ('content="%s"' % HOME_TITLE, 'content="Gallery | J Masocha Photography, Pretoria"'),
    ('<meta name="description" content="%s">' % HOME_DESC, '<meta name="description" content="%s">' % GALLERY_DESC),
    ('<meta property="og:description" content="%s">' % HOME_DESC, '<meta property="og:description" content="%s">' % GALLERY_DESC),
    ('<link rel="canonical" href="https://www.jmasochaphoto.co.za/">', '<link rel="canonical" href="https://www.jmasochaphoto.co.za/gallery.html">'),
    ('<meta property="og:url" content="https://www.jmasochaphoto.co.za/">', '<meta property="og:url" content="https://www.jmasochaphoto.co.za/gallery.html">'),
]
for old, new in swaps:
    if html.count(old) == 0:
        raise SystemExit("index.html changed: can't find " + old)
    html = html.replace(old, new)
html = html.replace("<!doctype html>", "<!doctype html>\n<!-- Generated from index.html by tools/make-gallery-page.py. Edit index.html, not this file. -->", 1)
(root / "gallery.html").write_text(html, encoding="utf-8")
print("gallery.html updated")
