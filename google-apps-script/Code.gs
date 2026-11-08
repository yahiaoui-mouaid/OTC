// One Tech Crew registrations -> Google Sheet.
// Paste this into Extensions > Apps Script of your Google Sheet, then deploy it as a Web app.

var SHEET_NAME = 'Registrations';
var TIME_ZONE = 'Africa/Algiers';

// [column title, field sent by the website]
var COLUMNS = [
  ['Full name', 'fullName'], ['Date of birth', 'birthDate'], ['Email', 'email'], ['Phone', 'phone'],
  ['University', 'university'], ['Faculty', 'faculty'], ['Department', 'department'], ['Specialty', 'specialty'], ['Study level', 'level'], ['Student ID', 'studentId'],
  ['Departments', 'interests'], ['CS choice', 'csChoice'], ['Tech choice', 'techChoice'], ['Social media choice', 'socialChoice'], ['Logistics choice', 'logisticsChoice'],
  ['Top department', 'firstTeam'], ['Second choice', 'secondTeam'], ['Current level', 'skillLevel'], ['Skills and tools', 'skills'],
  ['Free days', 'days'], ['Hours per week', 'hours'], ['Has laptop', 'laptop'], ['Heard from', 'heardFrom'],
  ['Motivation', 'motivation'], ['Hopes to learn or build', 'goal'], ['Experience', 'experience'],
  ['Discord', 'discord'], ['LinkedIn', 'linkedin'], ['Portfolio', 'portfolio'],
  ['Accepted rules', 'agreeRules'], ['Accepted data use', 'agreeData'], ['Photos OK', 'photoOk'],
];
var REQUIRED = ['fullName', 'birthDate', 'email', 'phone', 'university', 'faculty', 'department', 'specialty', 'level', 'studentId',
  'interests', 'firstTeam', 'skillLevel', 'days', 'hours', 'laptop', 'heardFrom', 'motivation', 'goal', 'discord', 'agreeRules', 'agreeData'];

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (Array.isArray(value)) value = value.join(', ');
  return String(value === undefined || value === null ? '' : value).trim().slice(0, 3000);
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    var titles = ['Submitted at'].concat(COLUMNS.map(function (c) { return c[0]; }));
    sheet.getRange(1, 1, 1, titles.length).setValues([titles]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet() {
  return reply({ ok: true, service: 'OTC registrations' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = JSON.parse(e.postData.contents);

    for (var i = 0; i < REQUIRED.length; i++) {
      var v = data[REQUIRED[i]];
      if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)) {
        return reply({ ok: false, error: 'missing', field: REQUIRED[i] });
      }
    }

    var sheet = getSheet();
    var email = clean(data.email).toLowerCase();
    var emailColumn = 2 + COLUMNS.map(function (c) { return c[1]; }).indexOf('email');
    var rows = sheet.getLastRow();
    if (rows > 1) {
      var existing = sheet.getRange(2, emailColumn, rows - 1, 1).getValues();
      for (var r = 0; r < existing.length; r++) {
        if (String(existing[r][0]).trim().toLowerCase() === email) return reply({ ok: false, error: 'duplicate' });
      }
    }

    var stamp = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm');
    var row = [stamp].concat(COLUMNS.map(function (c) { return clean(data[c[1]]); }));
    // Plain-text cells keep the leading 0 of phone numbers and stop answers running as formulas.
    sheet.getRange(rows + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}
