# Newsletter set-up (subscribers and promotion emails)

People who subscribe on the website are saved in a Google Sheet, and the
promotions you send from the website manager (`admin.html`) are emailed from
your Gmail. It's free, and setting it up takes about 5 minutes.

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

The website's newsletter form now saves sign-ups to your sheet, and the
**Subscribers** tab lists them and sends promotions.

## Good to know

- Gmail lets a free account send to about **100 people a day** (Google Workspace accounts get 1,500). The Subscribers tab shows how many you can still send today.
- Every email has an **Unsubscribe** link. People who use it are marked "Unsubscribed" and won't get further emails.
- If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**, so the web app URL stays the same.
- If you've lost your admin key, open **Project Settings → Script properties** in Apps Script to see `ADMIN_KEY`.
