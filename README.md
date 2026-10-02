# J Masocha Photography — website

Website for J Masocha Photography, a photography, videography and printing studio in Pretoria Central.

It is a single static page (`index.html`) with its photos in `img/`. There is no WordPress, database or build step. Upload the files to any web host, or turn on GitHub Pages for this repository.

## What's on the page

- Header with dropdown menus (About, Gallery, Photo Session Information, Our Services, Packages & Pricing, Printed Products, Contact), a social media button and a light/dark switch
- Gallery grouped by backdrop colour (dark, grey, white, colour, outdoors), with category filters, an "All photos" window and a full-screen viewer (slideshow, zoom, share)
- Photo sessions, services, a packages request form, a print showcase with a print order form, about, team and Google reviews
- Contact window (email, WhatsApp or call), newsletter sign-up and footer

Bookings, print orders and contact messages open WhatsApp or the visitor's email app with the details already filled in, so no server is needed.

## Updating the site

All settings are near the top of the `<script>` section in `index.html`.

| What | Where to change it |
| --- | --- |
| Phone/WhatsApp number and email | `var WA = "27661322462", MAIL = "wanhloni@gmail.com";` |
| Facebook, TikTok and Instagram links | `var SOCIAL = { facebook: "", tiktok: "", instagram: "" };` (an empty link shows "coming soon") |
| Newsletter list (Mailchimp, Brevo or Formspree form URL) | `var NEWSLETTER_URL = "";` (empty means sign-ups arrive by email) |
| Gallery photos and categories | `var TONES = [ ... ]` |

### Adding a gallery photo

1. Save two WebP versions in `img/`: `name-700.webp` (about 700px wide) and `name-1600.webp` (about 1600px wide).
2. Add a line to the right backdrop group in `TONES`:
   `["name", "Caption", "categories", width, height]`, where width and height are the size of the 700px file and categories are any of `kids women men couples family maternity graduation birthdays outdoor`.
3. Category counts and filters update automatically.

## Publishing with GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root. The site will then be available at `https://carvenmaceke.github.io/j-mosocha/`, or at your own domain if you add one.
