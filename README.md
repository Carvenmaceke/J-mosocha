# J Masocha Photography — website

Website for J Masocha Photography, a photography, videography and printing studio in Pretoria Central.

It is a static page (`index.html`) with its photos in `img/`, plus a private website manager (`admin.html`) for the owner. There is no WordPress, database or build step. It's made to run on GitHub Pages.

## What's on the page

- Header with dropdown menus (About, Gallery, Photo Session Information, Specials, Our Services, Packages & Pricing, Printed Products, Contact) and a social media button
- Current specials (shown only while a special is running)
- Gallery grouped by backdrop colour (dark, grey, white, colour, outdoors), with a category filter, a backdrop timeline, an "All photos" window and a full-screen viewer (slideshow, zoom, share)
- Photo sessions, services, the Adult Birthday price list, a packages request form, a print showcase with a print order form, about, team and Google reviews
- Contact window (email, WhatsApp or call), newsletter sign-up and footer

**Online booking (`booking.html`):** clients choose a session and package, pick one of the open dates and times, enter their details, and either pay the deposit online (PayFast) or continue on WhatsApp and send proof of payment there. Each booking gets a unique booking code, shown on screen and emailed to the client. This needs the free Google Sheet set-up in [`newsletter/README.md`](newsletter/README.md). Until that's connected, the booking page sends people to WhatsApp.

Package enquiries, print orders and contact messages open WhatsApp or the visitor's email app with the details already filled in.

## Website manager (owner login)

Open **`/admin.html`** on the live site (for example `https://carvenmaceke.github.io/J-mosocha/admin.html`). It isn't linked from the website.

- **Gallery:** add photos (choose the backdrop and one or more categories), edit captions and categories, replace a picture with a new one, change the order (drag photos or use the arrows, then **Save order**), or delete photos. Photos are resized automatically.
- **Bookings:** a calendar of your open days. Set your usual weekly hours, close a day or change its times, add appointments for walk-ins and phone bookings, confirm deposits, and move or cancel bookings. Set PayFast and your banking details under **Opening hours & payments**.
- **Specials & posters:** post current sales, promotions or promotion posters with an offer, end date and optional poster (shown in full). They show in "Current specials" on the website and hide themselves after the end date. When the subscriber list is connected, each new post is emailed to all subscribers straight away, with the poster inside the email.
- **Subscribers:** see everyone who subscribed, remove people, download the list, and email a promotion to all subscribers. This needs the free Google Sheet set-up in [`newsletter/README.md`](newsletter/README.md).

Every change is saved straight into this repository as a commit, and the website updates within a few minutes.

### First-time set-up on a device

1. On GitHub, create a **fine-grained personal access token**: Settings → Developer settings → Fine-grained tokens → Generate new token.
   - Repository access: **Only select repositories → J-mosocha**
   - Permissions: **Contents → Read and write**
2. Open `admin.html`, paste the token and choose a password.

The token is stored only in that browser, locked with your password, and from then on you log in with the password alone. To use another phone or computer, repeat the set-up there with the same token or a new one. If the token expires, choose "Forgot password? Set up this device again" on the login screen and paste a new token.

## Updating the site by hand

Most settings are near the top of the `<script>` section in `index.html`.

| What | Where to change it |
| --- | --- |
| Phone/WhatsApp number and email | `var WA = "27661322462", MAIL = "wanhloni@gmail.com";` |
| Facebook, TikTok and Instagram links | `var SOCIAL = { facebook: "", tiktok: "", instagram: "" };` (an empty link shows "coming soon") |
| Sessions, packages, prices and the deposit % | `packages.js` |
| Gallery photos | `gallery.js` (easier from the website manager) |
| Specials and the newsletter connection | `site.js` (easier from the website manager) |

## Private preview (before launch)

While the site is being finished, `index.html` and `booking.html` send visitors to `soon.html` (a "coming soon" page). To see the real site, open it once with the secret preview link (ask the developer for it); that browser then remembers it. Add `?preview=off` to a page address to lock that browser again. The website manager (`admin.html`) is not affected.

**To launch:** delete the `<script>` line marked "Private preview" near the top of `index.html` and `booking.html`.

## Publishing with GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root. The site will then be available at `https://carvenmaceke.github.io/J-mosocha/`, or at your own domain if you add one.
