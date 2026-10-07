# Newsletter and online booking set-up

One free Google Sheet and script runs both:

- **Newsletter:** people who subscribe on the website are saved in the sheet, and the promotions you send from the website manager (`admin.html`) are emailed from your Gmail.
- **Online bookings:** the booking page (`booking.html`) shows only your open dates and times, saves each booking with its own booking code, emails the client a confirmation and you a notification, and receives PayFast payments.

Setting it up takes about 5 minutes.

## 1. Create the sheet and script

1. Sign in to the Gmail account the emails should come from.
2. Go to [sheets.new](https://sheets.new) to create a new Google Sheet. Name it **J Masocha subscribers**.
3. In the sheet, open **Extensions → Apps Script**.
4. Delete everything in the editor, then paste the full contents of `newsletter/Code.gs`.
5. Click **Save** (the disk icon).

## 2. Run the setup once

1. In the toolbar's function menu, choose **setup**, then click **Run**.
2. Google will ask for permission. Click **Review permissions**, choose your account, then **Advanced → Go to project (unsafe) → Allow**.
   (Google shows this warning for any script you write yourself. The script only uses this sheet and sends email from your account.)
3. Open **Execution log** at the bottom and copy your **admin key**.

## 3. Publish it

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

## 4. Connect the website

1. Open `admin.html` on your website and log in.
2. Click the gear (**Settings**).
3. Paste the **Web app URL** and the **admin key**, then click **Save**.

The website's newsletter form now saves sign-ups to your sheet, the
**Subscribers** tab lists them and sends promotions, and the **Bookings** tab
manages your calendar.

## 5. Set up bookings

In the website manager, open **Bookings → Opening hours & payments**:

1. Set your **usual weekly hours**: the start times clients can book on each day (for example `09:00, 10:00, 11:00`). Untick days you're closed.
2. Add your **banking details**. Clients who choose WhatsApp see them, with their booking code as the payment reference.
3. To take payments online, add your **PayFast** merchant ID, merchant key and passphrase (PayFast: Settings → Developer settings). Leave them empty and every client books through WhatsApp instead. Tick **Test mode** to try it with PayFast's sandbox first.

Then, from the calendar:

- Click any day to **close it**, or to **change its times** for that day only.
- Use **Add appointment** for bookings made at the studio, by phone or on WhatsApp. That time disappears from the booking page straight away.
- In the bookings list, use **Deposit received** when someone sends proof of payment. This confirms the booking and emails the client. You can also **Move** or **Cancel** a booking.

How a booking works for the client:

- **Pay online:** the client pays the deposit through PayFast and the booking is confirmed by itself.
- **Continue on WhatsApp:** the client's time is held (48 hours by default) while you chat. They pay by EFT and send the proof of payment on WhatsApp, and you click **Deposit received**. If no deposit comes in, the time opens up again by itself.

The deposit is 50% of the package price. Prices and the deposit percentage are in `packages.js`. For sessions without a listed price, the deposit is agreed on WhatsApp (or set `otherDeposit` in `packages.js`).

Every booking is a row in the **Bookings** sheet. Single-day changes are in the **Availability** sheet.

## Good to know

- When you post a special or poster in the website manager, it's emailed to all subscribers straight away, with the poster inside the email. Untick "Email it to all subscribers" if you only want it on the website.
- **Already set this up before bookings were added?** Paste the latest `Code.gs` into Apps Script, run **setup** once more (it adds the Bookings and Availability sheets and asks for the new permissions), then use **Deploy → Manage deployments → Edit → New version**.
- **Already set this up before posters were added?** Paste the latest `Code.gs` into Apps Script again, then use **Deploy → Manage deployments → Edit → New version** so emails can include the poster.

- Gmail lets a free account send to about **100 people a day** (Google Workspace accounts get 1,500). The Subscribers tab shows how many you can still send today.
- Every email has an **Unsubscribe** link. People who use it are marked "Unsubscribed" and won't get further emails.
- If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**, so the web app URL stays the same.
- If you've lost your admin key, open **Project Settings → Script properties** in Apps Script to see `ADMIN_KEY`.
