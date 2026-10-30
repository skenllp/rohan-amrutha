/* Amrutha & Rohan RSVP -> Google Sheet
   Works for the bride-side and groom-side websites.
   SHEET_ID: leave '' if this script was opened from the Sheet via Extensions > Apps Script.
   If the script is standalone, paste the Sheet ID (the long text between /d/ and /edit in the Sheet URL). */
var SHEET_ID = '';
var TAB = 'RSVP';

function getSheet_() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet found. Set SHEET_ID.');
  var sh = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Received (IST)', 'Name', 'Attending', 'Guests', 'Message', 'Side']);
  }
  return sh;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = {};
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (raw && raw.charAt(0) === '{') d = JSON.parse(raw);
    else if (e && e.parameter) d = e.parameter;
    getSheet_().appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
      String(d.name || '').slice(0, 80),
      String(d.attending).toLowerCase() === 'yes' ? 'Yes' : 'No',
      Number(d.guests) || 0,
      String(d.message || '').slice(0, 300),
      d.side === 'groom' ? 'Groom side' : 'Bride side'
    ]);
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* Open the /exec link in a browser: you should see {"ok":true,"status":"RSVP endpoint is live"} */
function doGet() {
  return reply_({ ok: true, status: 'RSVP endpoint is live' });
}

/* Run this once from the editor (select testAppend, press Run) to grant permissions and check the sheet. */
function testAppend() {
  getSheet_().appendRow([Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'), 'Test from editor', 'Yes', 1, 'Delete this row', 'Bride side']);
}
