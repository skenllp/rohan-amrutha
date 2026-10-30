/* Amrutha & Rohan RSVP -> Google Sheet
   Paste into Extensions > Apps Script of the Google Sheet, then Deploy > New deployment > Web app
   (Execute as: Me, Who has access: Anyone) and copy the /exec URL into js/script.js (rsvp.sheet). */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName('RSVP') || ss.insertSheet('RSVP');
    if (sh.getLastRow() === 0) sh.appendRow(['Received (IST)', 'Name', 'Attending', 'Guests', 'Message', 'Side']);
    sh.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
      String(d.name || '').slice(0, 80),
      d.attending === 'Yes' ? 'Yes' : 'No',
      Number(d.guests) || 0,
      String(d.message || '').slice(0, 300),
      d.side === 'groom' ? 'Groom side' : 'Bride side'
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
