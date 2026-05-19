const SHEET_NAME = '成績紀錄';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    const record = payload.record || payload;
    const sheet = getScoreSheet_();

    sheet.appendRow([
      record.createdAt ? new Date(record.createdAt) : new Date(),
      record.className || '',
      record.seatNumber || '',
      record.player || '',
      record.mode || '',
      record.score ?? '',
      record.correct ?? '',
      record.total ?? '',
      record.seconds ?? '',
      record.matchId || '',
      record.opponent || '',
      record.weakAreas || '',
      JSON.stringify(record.answers || [])
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getScoreSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '完成時間',
      '班級',
      '座號',
      '學生',
      '模式',
      '分數',
      '答對題數',
      '總題數',
      '秒數',
      '對戰編號',
      '對手',
      '不熟悉內容',
      '答題明細'
    ]);
  }

  return sheet;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
