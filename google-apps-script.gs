// BRCC Mongolia — Google Sheets руу өгөгдөл хүлээн авах скрипт.
// Заавар: README.md → "Google Sheets холбох". Энэ кодыг Google Sheet → Extensions → Apps Script дотор буулгаад
// Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone) гэж байршуулна.
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    (body.items || []).forEach(function (it) { upsert(ss, it.kind === "session" ? "Surveys" : "Data", it.row); });
    return ContentService.createTextOutput("ok");
  } finally { lock.releaseLock(); }
}
function upsert(ss, name, row) {
  let sh = ss.getSheetByName(name); if (!sh) sh = ss.insertSheet(name);
  let headers = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  const keys = Object.keys(row);
  keys.forEach(function (k) { if (headers.indexOf(k) < 0) { headers.push(k); sh.getRange(1, headers.length).setValue(k); } });
  const idCol = headers.indexOf("id") + 1;
  const last = sh.getLastRow();
  let target = 0;
  if (last > 1 && idCol > 0) {
    const ids = sh.getRange(2, idCol, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (ids[i][0] === row.id) { target = i + 2; break; }
  }
  const values = headers.map(function (h) { return row[h] === undefined || row[h] === null ? "" : row[h]; });
  if (target) sh.getRange(target, 1, 1, headers.length).setValues([values]);
  else sh.appendRow(values);
}
function doGet() { return ContentService.createTextOutput("BRCC Mongolia sync endpoint OK"); }
