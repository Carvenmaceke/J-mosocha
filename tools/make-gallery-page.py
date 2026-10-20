"""Rebuild the gallery, services, sessions, packages, prints, about and contact pages from index.html.

Both pages are the same file as the home page with data-page="gallery", "services", "sessions", "packages",
"prints", "about" or "contact" on <html>, which shows only that section. Run this after
every change to index.html:

    python3 tools/make-gallery-page.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
HOME_TITLE = "J Masocha Photography | Photographer in Pretoria Central"
HOME_DESC = "Photography, videography and printing studio in Pretoria Central since 2010. Kids, birthday, cake smash, maternity, graduation, couples, family and corporate photoshoots."
PAGES = {
    "gallery": ("Gallery | J Masocha Photography, Pretoria",
                "See our studio work in Pretoria: birthday, cake smash, babies, maternity, graduation, couples, family and portrait photoshoots by J Masocha Photography."),
    "sessions": ("Photo Sessions in Pretoria | Birthday, Maternity, Graduation & Family Shoots | J Masocha Photography",
                 "Photo sessions for every milestone at J Masocha Photography, Pretoria Central: kids birthday and cake smash, adult birthday, maternity, graduation, couples and family, outdoor, corporate, events and product shoots."),
    "packages": ("Packages & Pricing | Adult Birthday Photoshoot Packages in Pretoria | J Masocha Photography",
                 "Photoshoot packages and prices at J Masocha Photography, Pretoria Central: adult birthday packages from R750, with edited images, props, video and online gallery. Book online with a 50% deposit."),
    "prints": ("Printed Products | Canvas, Frames & Photo Gifts in Pretoria | J Masocha Photography",
               "Order canvas prints, framed photos, albums, photo globes, tumblers, mugs, plates and T-shirts, printed in-house at J Masocha Photography in Pretoria Central."),
    "about": ("About Us | J Masocha Photography, Pretoria Central since 2010",
              "J Masocha Photography is a photography, videography and printing studio in Pretoria Central, capturing life's milestones since 2010. Our mission, our goal and our story."),
    "contact": ("Contact Us | J Masocha Photography, Pretoria Central",
                "Contact J Masocha Photography at 235 Helen Joseph Street, Pretoria Central. Email, WhatsApp or call 066 132 2462 to book a photoshoot or ask a question."),
    "services": ("Our Services | Photography, Videography & Printing in Pretoria | J Masocha Photography",
                 "Photography, videography and printing by J Masocha Photography in Pretoria Central: birthday, cake smash, maternity, graduation, family and corporate shoots, event films, canvases, frames and photo gifts."),
}
home = (root / "index.html").read_text(encoding="utf-8")
for page, (title, desc) in PAGES.items():
    html = home
    swaps = [
        ('<html lang="en-ZA" data-theme="light">', '<html lang="en-ZA" data-theme="light" data-page="%s">' % page),
        ("<title>%s</title>" % HOME_TITLE, "<title>%s</title>" % title),
        ('content="%s"' % HOME_TITLE, 'content="%s"' % title),
        ('<meta name="description" content="%s">' % HOME_DESC, '<meta name="description" content="%s">' % desc),
        ('<meta property="og:description" content="%s">' % HOME_DESC, '<meta property="og:description" content="%s">' % desc),
        ('<link rel="canonical" href="https://www.jmasochaphoto.co.za/">', '<link rel="canonical" href="https://www.jmasochaphoto.co.za/%s.html">' % page),
        ('<meta property="og:url" content="https://www.jmasochaphoto.co.za/">', '<meta property="og:url" content="https://www.jmasochaphoto.co.za/%s.html">' % page),
    ]
    for old, new in swaps:
        if html.count(old) == 0:
            raise SystemExit("index.html changed: can't find " + old)
        html = html.replace(old, new)
    html = html.replace("<!doctype html>", "<!doctype html>\n<!-- Generated from index.html by tools/make-gallery-page.py. Edit index.html, not this file. -->", 1)
    (root / (page + ".html")).write_text(html, encoding="utf-8")
    print(page + ".html updated")
