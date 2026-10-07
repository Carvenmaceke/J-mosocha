/**
 * J Masocha Photography – newsletter and booking service (Google Apps Script)
 *
 * Keeps the subscriber list and the bookings in this Google Sheet, sends
 * promotion and booking emails from the owner's Gmail, and receives PayFast
 * payment notices. Set-up steps are in newsletter/README.md.
 *
 * Script property needed: ADMIN_KEY (any long secret phrase). The admin page
 * uses it to manage subscribers, bookings and opening hours; visitors can only
 * subscribe, see open times, make a booking and check their own booking.
 */

var SHEET = "Subscribers";
var FROM_NAME = "J Masocha Photography";
var SITE_URL = "https://carvenmaceke.github.io/J-mosocha/";

/**
 * Run this once from the editor (select "setup", then Run). It creates the
 * Subscribers sheet, asks for permission to send email, and creates your
 * admin key if you don't have one yet. The key is shown in the log.
 */
function setup() {
  sheet_(); bookSheet_(); daysSheet_();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_KEY")) props.setProperty("ADMIN_KEY", Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "").slice(0, 8));
  MailApp.getRemainingDailyQuota();
  Logger.log("Your admin key: " + props.getProperty("ADMIN_KEY"));
}

function doPost(e) {
  if (e && e.parameter && e.parameter.pf_payment_id) return payfastNotice_(e);   // PayFast payment notice
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { d = e.parameter || {}; }
  var action = d.action || "subscribe";
  if (action === "subscribe") return json_(subscribe_(d.email));
  if (action === "slots") return json_(publicSlots_());
  if (action === "book") return json_(book_(d));
  if (action === "booking") return json_(lookup_(d.code));

  var key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key || d.key !== key) return json_({ ok: false, error: "not-allowed" });
  if (action === "list") return json_({ ok: true, subscribers: list_(), quota: MailApp.getRemainingDailyQuota() });
  if (action === "remove") { setStatus_(d.email, "removed"); return json_({ ok: true }); }
  if (action === "send") return json_(send_(d));
  if (action === "bookings") return json_(adminBookings_());
  if (action === "setDay") return json_(setDay_(d));
  if (action === "appointment") return json_(appointment_(d));
  if (action === "updateBooking") return json_(updateBooking_(d));
  if (action === "bookingSettings") return json_(saveSettings_(d.settings || {}));
  return json_({ ok: false, error: "unknown-action" });
}

// Unsubscribe links in emails land here
function doGet(e) {
  var p = (e && e.parameter) || {};
  var page = function (msg) {
    return HtmlService.createHtmlOutput('<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 16px;text-align:center;color:#1d1d1f"><p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#9a7a4a">J Masocha Photography</p><p style="font-size:18px">' + msg + '</p><p><a href="' + SITE_URL + '" style="color:#9a7a4a">Visit our website</a></p></div>').setTitle("J Masocha Photography");
  };
  if (p.unsubscribe && p.t && p.t === token_(p.unsubscribe)) {
    setStatus_(p.unsubscribe, "unsubscribed");
    return page("You’ve been unsubscribed. You won’t receive any more promotions from us.");
  }
  return page("Thanks for being part of J Masocha Photography.");
}

function sheet_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(["Email", "Subscribed", "Status"]); sh.setFrozenRows(1); }
  return sh;
}

function rows_() {
  var sh = sheet_(), n = sh.getLastRow();
  return n < 2 ? [] : sh.getRange(2, 1, n - 1, 3).getValues();
}

function subscribe_(email) {
  email = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { ok: false, error: "invalid-email" };
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(), rows = rows_();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).toLowerCase() === email) {
        if (rows[i][2] !== "active") sh.getRange(i + 2, 2, 1, 2).setValues([[new Date(), "active"]]);
        return { ok: true };
      }
    }
    sh.appendRow([email, new Date(), "active"]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function list_() {
  return rows_().filter(function (r) { return r[0]; }).map(function (r) {
    return { email: String(r[0]), since: r[1] instanceof Date ? r[1].toISOString() : String(r[1]), status: String(r[2] || "active") };
  });
}

function setStatus_(email, status) {
  email = String(email || "").trim().toLowerCase();
  var sh = sheet_(), rows = rows_();
  for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).toLowerCase() === email) sh.getRange(i + 2, 3).setValue(status);
}

function token_(email) {
  var key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "";
  var sig = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), key);
  return Utilities.base64EncodeWebSafe(sig).slice(0, 22);
}

function esc_(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

function send_(d) {
  var subject = String(d.subject || "").trim(), message = String(d.message || "").trim();
  // Optional poster, sent as a JPEG inside the email
  var poster = null;
  if (d.image) { try { poster = Utilities.newBlob(Utilities.base64Decode(String(d.image)), "image/jpeg", "poster.jpg"); } catch (x) { poster = null; } }
  if (!subject || (!message && !poster)) return { ok: false, error: "missing-subject-or-message" };
  var to = list_().filter(function (s) { return s.status === "active"; });
  if (!to.length) return { ok: false, error: "no-subscribers" };
  var quota = MailApp.getRemainingDailyQuota();
  if (to.length > quota) return { ok: false, error: "over-quota", quota: quota, count: to.length };

  var link = d.link ? String(d.link) : SITE_URL;
  var linkText = esc_(d.linkText || "Visit our website");
  var unsubBase = ScriptApp.getService().getUrl();
  var body = esc_(message).replace(/\n/g, "<br>");
  var sent = 0;
  to.forEach(function (s) {
    var unsub = unsubBase + "?unsubscribe=" + encodeURIComponent(s.email) + "&t=" + token_(s.email);
    var html =
      '<div style="background:#f2f2f1;padding:30px 12px;font-family:Helvetica,Arial,sans-serif;color:#1d1d1f">' +
      '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px">' +
      '<p style="margin:0 0 6px;letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#9a7a4a">J Masocha Photography</p>' +
      '<h1 style="margin:0 0 18px;font-weight:400;font-size:26px;line-height:1.25">' + esc_(subject) + "</h1>" +
      (poster ? '<a href="' + esc_(link) + '"><img src="cid:poster" alt="' + esc_(subject) + '" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;border-radius:12px;margin:0 0 22px"></a>' : "") +
      (message ? '<p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#3a3a3a">' + body + "</p>" : "") +
      '<a href="' + esc_(link) + '" style="display:inline-block;background:#1d1d1f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px">' + linkText + "</a>" +
      '<p style="margin:28px 0 0;font-size:13px;color:#8e8b86">235 Helen Joseph Street, Pretoria Central &middot; 066 132 2462</p>' +
      "</div>" +
      '<p style="max-width:560px;margin:14px auto 0;text-align:center;font-size:12px;color:#8e8b86">You’re receiving this because you subscribed on our website. <a href="' + unsub + '" style="color:#8e8b86">Unsubscribe</a></p>' +
      "</div>";
    var mail = { to: s.email, subject: subject, htmlBody: html, body: (message ? message + "\n\n" : "") + link + "\n\nUnsubscribe: " + unsub, name: FROM_NAME };
    if (poster) mail.inlineImages = { poster: poster };
    MailApp.sendEmail(mail);
    sent++;
  });
  return { ok: true, sent: sent, quota: MailApp.getRemainingDailyQuota() };
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* =====================================================================
 * Bookings
 * Opening hours come from the weekly hours in the booking settings, unless
 * the owner changed a specific day (Availability sheet). A time is free when
 * no active booking holds it. Unpaid bookings hold their time until their
 * "Hold until" moment; confirmed bookings always do.
 * ===================================================================== */

var BOOK_SHEET = "Bookings", DAYS_SHEET = "Availability", TZ = "Africa/Johannesburg", TZ_OFFSET = "+02:00";
var BOOK_COLS = ["Code", "Created", "Date", "Time", "Session", "Package", "Price", "Deposit", "Name", "Phone", "Email", "Notes", "Source", "Payment", "Status", "Paid", "Hold until", "Payment ref"];
var BOOK_KEYS = ["code", "created", "date", "time", "session", "pkg", "price", "deposit", "name", "phone", "email", "notes", "source", "payment", "status", "paid", "holdUntil", "ref"];
var HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
var BOOK_DEFAULTS = {
  week: { "0": [], "1": HOURS, "2": HOURS, "3": HOURS, "4": HOURS, "5": HOURS, "6": HOURS },   // 0 = Sunday
  holdHours: 48,        // how long a WhatsApp booking keeps its time while waiting for the deposit
  payHoldMinutes: 120,  // how long an online booking keeps its time while the client pays
  noticeHours: 12,      // how soon before a session people can still book it online
  daysAhead: 90,        // how far ahead people can book
  bank: "",             // banking details shown to people who pay by EFT
  payfast: { merchantId: "", merchantKey: "", passphrase: "", sandbox: false }
};

function sheetWith_(name, cols) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1000, cols.length).setNumberFormat("@");   // keep dates and times as typed
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}
function bookSheet_() { return sheetWith_(BOOK_SHEET, BOOK_COLS); }
function daysSheet_() { return sheetWith_(DAYS_SHEET, ["Date", "Open", "Times"]); }

function settings_() {
  var raw = PropertiesService.getScriptProperties().getProperty("BOOKING_SETTINGS"), o = {};
  try { o = raw ? JSON.parse(raw) : {}; } catch (x) { o = {}; }
  var s = JSON.parse(JSON.stringify(BOOK_DEFAULTS));
  Object.keys(o).forEach(function (k) { if (k !== "payfast") s[k] = o[k]; });
  if (o.payfast) Object.keys(o.payfast).forEach(function (k) { s.payfast[k] = o.payfast[k]; });
  return s;
}
function payReady_(s) { return !!(s.payfast.merchantId && s.payfast.merchantKey); }

function str_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, v.getHours() || v.getMinutes() ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd");
  return String(v === null || v === undefined ? "" : v);
}
function bookings_() {
  var sh = bookSheet_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, BOOK_COLS.length).getValues().map(function (r, i) {
    var b = { row: i + 2 };
    BOOK_KEYS.forEach(function (k, j) { b[k] = k === "time" && r[j] instanceof Date ? Utilities.formatDate(r[j], TZ, "HH:mm") : str_(r[j]); });
    b.price = Number(b.price) || 0; b.deposit = Number(b.deposit) || 0; b.paid = Number(b.paid) || 0;
    return b;
  }).filter(function (b) { return b.code; });
}
function writeBooking_(b) {
  var sh = bookSheet_(), row = BOOK_KEYS.map(function (k) { return b[k] === undefined ? "" : String(b[k]); });
  if (b.row) sh.getRange(b.row, 1, 1, row.length).setValues([row]);
  else { sh.appendRow(row); b.row = sh.getLastRow(); }
}
function overrides_() {
  var sh = daysSheet_(), n = sh.getLastRow(), o = {};
  if (n < 2) return o;
  sh.getRange(2, 1, n - 1, 3).getValues().forEach(function (r) {
    var d = str_(r[0]); if (!d) return;
    o[d] = { open: String(r[1]) === "yes", times: String(r[2] || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean) };
  });
  return o;
}

function at_(date, time) { return new Date(date + "T" + (time || "00:00") + ":00" + TZ_OFFSET); }
function today_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd"); }
function addDays_(date, n) { var d = at_(date, "12:00"); d.setUTCDate(d.getUTCDate() + n); return Utilities.formatDate(d, TZ, "yyyy-MM-dd"); }
function validDate_(d) { return /^\d{4}-\d{2}-\d{2}$/.test(String(d || "")); }
function validTime_(t) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t || "")); }

function timesFor_(date, s, ov) {
  if (ov[date]) return ov[date].open ? ov[date].times.slice() : [];
  return (s.week[String(at_(date, "12:00").getUTCDay())] || []).slice();
}
function holds_(b, now) {
  if (b.status === "confirmed") return true;
  if (b.status !== "awaiting-payment") return false;
  return !b.holdUntil || at_(b.holdUntil.slice(0, 10), b.holdUntil.slice(11, 16)) > now;
}
// Free times per date, from today up to the booking window
function freeTimes_(s, ov, list) {
  var now = new Date(), from = today_(), out = {}, taken = {};
  list.forEach(function (b) { if (holds_(b, now)) taken[b.date + " " + b.time] = true; });
  var soonest = now.getTime() + s.noticeHours * 3600000;
  for (var i = 0; i <= s.daysAhead; i++) {
    var d = addDays_(from, i);
    var free = timesFor_(d, s, ov).filter(function (t) { return !taken[d + " " + t] && at_(d, t).getTime() >= soonest; }).sort();
    if (free.length) out[d] = free;
  }
  return out;
}
function publicSlots_() {
  var s = settings_();
  return { ok: true, days: freeTimes_(s, overrides_(), bookings_()), payOnline: payReady_(s), until: addDays_(today_(), s.daysAhead) };
}

// Prices come from packages.js on the website, so they are only kept in one place
function prices_() {
  var cache = CacheService.getScriptCache(), hit = cache.get("prices");
  if (hit) return JSON.parse(hit);
  var p = { depositPercent: 50, otherDeposit: 0, sessions: [], packages: [] };
  try {
    var txt = UrlFetchApp.fetch(SITE_URL + "packages.js?" + Date.now(), { muteHttpExceptions: true }).getContentText();
    var a = txt.indexOf("{", txt.indexOf("window.PRICES")), b = txt.lastIndexOf("}");
    if (a > -1) p = JSON.parse(txt.slice(a, b + 1));
    cache.put("prices", JSON.stringify(p), 600);
  } catch (x) {}
  return p;
}
function cost_(session, pkg) {
  var p = prices_(), k = (p.packages || []).filter(function (x) { return x.session === session && x.name === pkg; })[0];
  if (k) return { price: k.price, deposit: Math.round(k.price * (p.depositPercent || 50) / 100) };
  return { price: 0, deposit: Number(p.otherDeposit) || 0 };
}

function newCode_(list) {
  var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", used = {};
  list.forEach(function (b) { used[b.code] = true; });
  for (;;) {
    var c = "JM-"; for (var i = 0; i < 6; i++) c += abc.charAt(Math.floor(Math.random() * abc.length));
    if (!used[c]) return c;
  }
}
function clean_(v, max) { return String(v || "").replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max); }
function stamp_(ms) { return Utilities.formatDate(new Date(ms), TZ, "yyyy-MM-dd'T'HH:mm"); }

// What a client may see about their own booking
function publicBooking_(b, s) {
  return { code: b.code, date: b.date, time: b.time, session: b.session, pkg: b.pkg, price: b.price, deposit: b.deposit, name: b.name,
    payment: b.payment, status: b.status, paid: b.paid, holdUntil: b.holdUntil, bank: b.status === "awaiting-payment" ? s.bank : "" };
}

function book_(d) {
  var s = settings_();
  var name = clean_(d.name, 80), phone = clean_(d.phone, 20).replace(/[^\d+]/g, ""), email = clean_(d.email, 200).toLowerCase();
  var session = clean_(d.session, 60), pkg = clean_(d.pkg, 80), notes = clean_(d.notes, 600), pay = d.pay === "online" ? "online" : "whatsapp";
  if (!name) return { ok: false, error: "Please add your name." };
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "Please add a valid phone number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please add a valid email address." };
  if (!session) return { ok: false, error: "Please choose a session." };
  if (!validDate_(d.date) || !validTime_(d.time)) return { ok: false, error: "Please choose a date and time." };
  var c = cost_(session, pkg);
  if (pay === "online" && (!payReady_(s) || !c.deposit)) return { ok: false, error: "Online payment isn’t available for this session. Please continue on WhatsApp." };

  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var b;
  try {
    var list = bookings_(), free = freeTimes_(s, overrides_(), list)[d.date] || [];
    if (free.indexOf(d.time) < 0) return { ok: false, error: "taken", message: "Sorry, that time was just booked. Please choose another time." };
    var now = Date.now();
    b = { code: newCode_(list), created: stamp_(now), date: d.date, time: d.time, session: session, pkg: pkg, price: c.price, deposit: c.deposit,
      name: name, phone: phone, email: email, notes: notes, source: "online", payment: pay, status: "awaiting-payment", paid: 0,
      holdUntil: stamp_(now + (pay === "online" ? s.payHoldMinutes * 60000 : s.holdHours * 3600000)), ref: "" };
    writeBooking_(b);
  } finally { lock.releaseLock(); }

  try { mailBooking_(b, "new", s); } catch (x) {}
  var out = { ok: true, booking: publicBooking_(b, s) };
  if (pay === "online") out.payfast = payfastForm_(b, s);
  return out;
}

function lookup_(code) {
  code = clean_(code, 12).toUpperCase();
  var b = bookings_().filter(function (x) { return x.code === code; })[0];
  return b ? { ok: true, booking: publicBooking_(b, settings_()) } : { ok: false, error: "not-found" };
}

/* ---------- PayFast ---------- */
// PHP-style urlencode, which PayFast uses for its signature
function pfEnc_(v) { return encodeURIComponent(String(v).trim()).replace(/[!'()*~]/g, function (c) { return "%" + c.charCodeAt(0).toString(16).toUpperCase(); }).replace(/%20/g, "+"); }
function md5_(t) { return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, t, Utilities.Charset.UTF_8).map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function payfastForm_(b, s) {
  var page = SITE_URL + "booking.html?code=" + encodeURIComponent(b.code);
  var first = b.name.split(" ")[0], last = b.name.split(" ").slice(1).join(" ");
  var f = [["merchant_id", s.payfast.merchantId], ["merchant_key", s.payfast.merchantKey], ["return_url", page + "&paid=1"], ["cancel_url", page + "&cancelled=1"],
    ["notify_url", ScriptApp.getService().getUrl()], ["name_first", first], ["name_last", last], ["email_address", b.email],
    ["m_payment_id", b.code], ["amount", b.deposit.toFixed(2)], ["item_name", "Booking deposit " + b.code], ["item_description", b.session + (b.pkg ? " – " + b.pkg : "") + ", " + b.date + " " + b.time]]
    .filter(function (x) { return x[1] !== "" && x[1] !== undefined; });
  var sig = f.map(function (x) { return x[0] + "=" + pfEnc_(x[1]); }).join("&") + (s.payfast.passphrase ? "&passphrase=" + pfEnc_(s.payfast.passphrase) : "");
  f.push(["signature", md5_(sig)]);
  return { url: s.payfast.sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process", fields: f };
}
function payfastNotice_(e) {
  var s = settings_(), raw = String(e.postData && e.postData.contents || ""), p = e.parameter;
  var cut = raw.indexOf("&signature="), base = cut > -1 ? raw.slice(0, cut) : raw;
  var mine = md5_(base + (s.payfast.passphrase ? "&passphrase=" + pfEnc_(s.payfast.passphrase) : ""));
  if (mine !== p.signature) return ContentService.createTextOutput("bad signature");
  var host = s.payfast.sandbox ? "https://sandbox.payfast.co.za" : "https://www.payfast.co.za";
  var check = UrlFetchApp.fetch(host + "/eng/query/validate", { method: "post", payload: base, contentType: "application/x-www-form-urlencoded", muteHttpExceptions: true }).getContentText();
  if (String(check).trim() !== "VALID") return ContentService.createTextOutput("not valid");
  if (p.payment_status !== "COMPLETE") return ContentService.createTextOutput("ok");

  var lock = LockService.getScriptLock(), b; lock.waitLock(20000);
  try {
    b = bookings_().filter(function (x) { return x.code === p.m_payment_id; })[0];
    if (!b || b.status === "confirmed" || Math.abs(Number(p.amount_gross) - b.deposit) > 0.01) return ContentService.createTextOutput("ok");
    b.status = "confirmed"; b.paid = Number(p.amount_gross); b.ref = "PayFast " + p.pf_payment_id;
    writeBooking_(b);
  } finally { lock.releaseLock(); }
  try { mailBooking_(b, "paid", s); } catch (x) {}
  return ContentService.createTextOutput("ok");
}

/* ---------- Emails ---------- */
function niceDate_(d, t) { return Utilities.formatDate(at_(d, "12:00"), TZ, "EEEE d MMMM yyyy") + (t ? " at " + t : ""); }
function mailBooking_(b, kind, s) {
  var owner = Session.getEffectiveUser().getEmail(), when = niceDate_(b.date, b.time);
  var what = esc_(b.session) + (b.pkg ? " – " + esc_(b.pkg) : "");
  var rows = [["Booking code", "<b style=\"font-size:18px;letter-spacing:.08em\">" + b.code + "</b>"], ["Session", what], ["Date", when], ["Name", esc_(b.name)], ["Phone", esc_(b.phone)]];
  if (b.price) rows.push(["Package price", "R" + b.price]);
  if (b.deposit) rows.push([b.status === "confirmed" ? "Deposit paid" : "Deposit due", "R" + (b.status === "confirmed" && b.paid ? b.paid : b.deposit)]);
  var table = '<table style="width:100%;border-collapse:collapse;margin:0 0 20px;font-size:15px">' + rows.map(function (r) { return '<tr><td style="padding:8px 0;color:#8e8b86;width:42%;border-bottom:1px solid #eee">' + r[0] + '</td><td style="padding:8px 0;border-bottom:1px solid #eee">' + r[1] + "</td></tr>"; }).join("") + "</table>";
  var wa = "https://wa.me/27661322462?text=" + encodeURIComponent("Hi J Masocha Photography! My booking code is " + b.code + ".");
  var next;
  if (b.status === "confirmed") next = "Your booking is confirmed. We look forward to seeing you at the studio. If you need to change anything, message us on WhatsApp with your booking code.";
  else if (b.payment === "online") next = "Your time is held while you complete the deposit payment online. Once the payment goes through, you’ll receive a confirmation email.";
  else next = "Your time is held until " + niceDate_(b.holdUntil.slice(0, 10), b.holdUntil.slice(11, 16)) + ". To confirm it, pay the deposit and send the proof of payment on WhatsApp with your booking code." + (s.bank ? "<br><br><b>Banking details</b><br>" + esc_(s.bank).replace(/\n/g, "<br>") + "<br>Reference: " + b.code : "");
  var title = b.status === "confirmed" ? "Your booking is confirmed" : "We’ve received your booking";
  var html = '<div style="background:#f2f2f1;padding:30px 12px;font-family:Helvetica,Arial,sans-serif;color:#1d1d1f"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px 28px">' +
    '<p style="margin:0 0 6px;letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#9a7a4a">J Masocha Photography</p>' +
    '<h1 style="margin:0 0 18px;font-weight:400;font-size:26px;line-height:1.25">' + title + "</h1>" + table +
    '<p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#3a3a3a">' + next + "</p>" +
    '<a href="' + wa + '" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px">Message us on WhatsApp</a>' +
    '<p style="margin:28px 0 0;font-size:13px;color:#8e8b86">235 Helen Joseph Street, Pretoria Central &middot; 066 132 2462</p></div></div>';
  if (b.email) MailApp.sendEmail({ to: b.email, subject: title + " – " + b.code, htmlBody: html, body: title + "\n\nBooking code: " + b.code + "\n" + b.session + "\n" + when, name: FROM_NAME, replyTo: owner });
  if (kind !== "confirmed" && owner) {
    var head = kind === "paid" ? "Deposit paid online: " : "New booking: ";
    MailApp.sendEmail({ to: owner, subject: head + b.name + ", " + when, name: "Website bookings", replyTo: b.email || owner,
      htmlBody: '<div style="font-family:Helvetica,Arial,sans-serif;color:#1d1d1f"><h2 style="font-weight:400">' + head + esc_(b.name) + "</h2>" + table +
        "<p>Payment: " + (b.payment === "online" ? "online (PayFast)" : "WhatsApp / EFT") + "<br>Email: " + esc_(b.email) + (b.notes ? "<br>Notes: " + esc_(b.notes) : "") + "</p><p>Manage it in the website manager’s Bookings tab.</p></div>" });
  }
}

/* ---------- Owner tools (need the admin key) ---------- */
function adminBookings_() {
  var s = settings_(), from = addDays_(today_(), -60), safe = JSON.parse(JSON.stringify(s));
  safe.payfast.passphrase = s.payfast.passphrase ? "********" : "";
  return { ok: true, today: today_(), bookings: bookings_().filter(function (b) { return b.date >= from; }), days: overrides_(), settings: safe, payOnline: payReady_(s) };
}
function setDay_(d) {
  if (!validDate_(d.date)) return { ok: false, error: "bad-date" };
  var times = (d.times || []).map(String).filter(validTime_).sort();
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = daysSheet_(), n = sh.getLastRow(), rows = n < 2 ? [] : sh.getRange(2, 1, n - 1, 1).getValues(), at = -1;
    for (var i = 0; i < rows.length; i++) if (str_(rows[i][0]) === d.date) at = i + 2;
    if (d.mode === "default") { if (at > -1) sh.deleteRow(at); }
    else {
      var row = [d.date, d.mode === "open" && times.length ? "yes" : "no", times.join(", ")];
      if (at > -1) sh.getRange(at, 1, 1, 3).setValues([row]); else sh.appendRow(row);
    }
  } finally { lock.releaseLock(); }
  return adminBookings_();
}
// A booking the owner adds by hand, e.g. someone who walked into the studio
function appointment_(d) {
  if (!validDate_(d.date) || !validTime_(d.time)) return { ok: false, error: "Choose a date and time." };
  var name = clean_(d.name, 80); if (!name) return { ok: false, error: "Add the client’s name." };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var list = bookings_(), now = new Date();
    if (list.some(function (b) { return b.date === d.date && b.time === d.time && holds_(b, now); })) return { ok: false, error: "There is already a booking at that time." };
    var c = cost_(clean_(d.session, 60), clean_(d.pkg, 80));
    writeBooking_({ code: newCode_(list), created: stamp_(Date.now()), date: d.date, time: d.time, session: clean_(d.session, 60) || "Studio session", pkg: clean_(d.pkg, 80),
      price: c.price, deposit: c.deposit, name: name, phone: clean_(d.phone, 20), email: clean_(d.email, 200).toLowerCase(), notes: clean_(d.notes, 600),
      source: "studio", payment: "studio", status: "confirmed", paid: Number(d.paid) || 0, holdUntil: "", ref: "Added in the studio" });
  } finally { lock.releaseLock(); }
  return adminBookings_();
}
function updateBooking_(d) {
  var lock = LockService.getScriptLock(), b; lock.waitLock(20000);
  try {
    b = bookings_().filter(function (x) { return x.code === d.code; })[0];
    if (!b) return { ok: false, error: "Booking not found." };
    var was = b.status;
    if (d.status === "confirmed" || d.status === "cancelled") b.status = d.status;
    if (d.paid !== undefined && d.paid !== "") b.paid = Number(d.paid) || 0;
    if (d.date && d.time) {
      if (!validDate_(d.date) || !validTime_(d.time)) return { ok: false, error: "Choose a date and time." };
      var now = new Date();
      if (bookings_().some(function (x) { return x.code !== b.code && x.date === d.date && x.time === d.time && holds_(x, now); })) return { ok: false, error: "There is already a booking at that time." };
      b.date = d.date; b.time = d.time;
    }
    writeBooking_(b);
  } finally { lock.releaseLock(); }
  if (b.status === "confirmed" && was !== "confirmed" && d.notify !== false) { try { mailBooking_(b, "confirmed", settings_()); } catch (x) {} }
  return adminBookings_();
}
function saveSettings_(n) {
  var s = settings_();
  if (n.week) { s.week = {}; for (var i = 0; i < 7; i++) s.week[String(i)] = (n.week[String(i)] || []).map(String).filter(validTime_).sort(); }
  ["holdHours", "payHoldMinutes", "noticeHours", "daysAhead"].forEach(function (k) { if (n[k] !== undefined && !isNaN(Number(n[k]))) s[k] = Math.max(0, Math.min(k === "daysAhead" ? 365 : 10000, Number(n[k]))); });
  if (n.bank !== undefined) s.bank = String(n.bank).replace(/\r/g, "").trim().slice(0, 600);
  if (n.payfast) ["merchantId", "merchantKey", "passphrase", "sandbox"].forEach(function (k) {
    if (n.payfast[k] === undefined || (k === "passphrase" && n.payfast[k] === "********")) return;
    s.payfast[k] = k === "sandbox" ? !!n.payfast[k] : String(n.payfast[k]).trim();
  });
  PropertiesService.getScriptProperties().setProperty("BOOKING_SETTINGS", JSON.stringify(s));
  return adminBookings_();
}
