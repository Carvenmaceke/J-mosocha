/**
 * J Masocha Photography – newsletter service (Google Apps Script)
 *
 * Keeps the subscriber list in this Google Sheet and sends promotion emails
 * from the owner's Gmail. Set-up steps are in newsletter/README.md.
 *
 * Script property needed: ADMIN_KEY (any long secret phrase). The admin page
 * uses it to list subscribers and send emails; visitors can only subscribe.
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
  sheet_();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_KEY")) props.setProperty("ADMIN_KEY", Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "").slice(0, 8));
  MailApp.getRemainingDailyQuota();
  Logger.log("Your admin key: " + props.getProperty("ADMIN_KEY"));
}

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { d = e.parameter || {}; }
  var action = d.action || "subscribe";
  if (action === "subscribe") return json_(subscribe_(d.email));

  var key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key || d.key !== key) return json_({ ok: false, error: "not-allowed" });
  if (action === "list") return json_({ ok: true, subscribers: list_(), quota: MailApp.getRemainingDailyQuota() });
  if (action === "remove") { setStatus_(d.email, "removed"); return json_({ ok: true }); }
  if (action === "send") return json_(send_(d));
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
  if (!subject || !message) return { ok: false, error: "missing-subject-or-message" };
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
      '<p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#3a3a3a">' + body + "</p>" +
      '<a href="' + esc_(link) + '" style="display:inline-block;background:#1d1d1f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px">' + linkText + "</a>" +
      '<p style="margin:28px 0 0;font-size:13px;color:#8e8b86">Shop 5A, Centre Walk, 266 Pretorius St, Pretoria Central &middot; 066 132 2462</p>' +
      "</div>" +
      '<p style="max-width:560px;margin:14px auto 0;text-align:center;font-size:12px;color:#8e8b86">You’re receiving this because you subscribed on our website. <a href="' + unsub + '" style="color:#8e8b86">Unsubscribe</a></p>' +
      "</div>";
    MailApp.sendEmail({ to: s.email, subject: subject, htmlBody: html, body: message + "\n\n" + link + "\n\nUnsubscribe: " + unsub, name: FROM_NAME });
    sent++;
  });
  return { ok: true, sent: sent, quota: MailApp.getRemainingDailyQuota() };
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
