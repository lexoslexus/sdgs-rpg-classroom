const SCORE_SHEET_NAME = '成績紀錄';
const WAITING_ROOM_KEY = 'waitingRoom';

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.webAppUrl = ScriptApp.getService().getUrl();
  return template
    .evaluate()
    .setTitle('SDGs 永續島跳跳闖關')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function joinMatch(input) {
  const player = makePlayer_(input);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    cleanupOldRooms_();
    const props = PropertiesService.getScriptProperties();
    const waiting = JSON.parse(props.getProperty(WAITING_ROOM_KEY) || 'null');

    if (waiting && !sameStudent_(waiting.player, player)) {
      const room = {
        roomId: waiting.roomId,
        matchId: Utilities.getUuid(),
        status: 'ready',
        players: [waiting.player, player],
        createdAt: Date.now()
      };
      props.deleteProperty(WAITING_ROOM_KEY);
      props.setProperty(roomKey_(waiting.roomId), JSON.stringify(room));
      return room;
    }

    const roomId = Utilities.getUuid();
    const room = { roomId, status: 'waiting', player, createdAt: Date.now() };
    props.setProperty(WAITING_ROOM_KEY, JSON.stringify(room));
    props.setProperty(roomKey_(roomId), JSON.stringify({
      roomId,
      status: 'waiting',
      players: [player],
      createdAt: Date.now()
    }));
    return { roomId, status: 'waiting', players: [player] };
  } finally {
    lock.releaseLock();
  }
}

function getMatch(roomId) {
  cleanupOldRooms_();
  const room = JSON.parse(PropertiesService.getScriptProperties().getProperty(roomKey_(roomId)) || 'null');
  return room || { roomId, status: 'expired', players: [] };
}

function saveScore(input) {
  const player = makePlayer_(input);
  const answers = Array.isArray(input.answers) ? input.answers : [];
  const correct = answers.filter(answer => answer.correct).length;
  const record = {
    id: Utilities.getUuid(),
    createdAt: new Date().toISOString(),
    className: player.className,
    seatNumber: player.seatNumber,
    player: player.label,
    mode: input.mode === 'duel' ? 'duel' : 'solo',
    score: Number(input.score) || 0,
    correct,
    total: answers.length,
    seconds: Number(input.seconds) || 0,
    matchId: input.matchId || '',
    opponentLabel: input.opponentLabel || '',
    weakAreas: summarizeWeakAreas_(answers),
    answers
  };

  getScoreSheet_().appendRow([
    record.id,
    new Date(record.createdAt),
    record.className,
    record.seatNumber,
    record.player,
    record.mode === 'duel' ? '兩人對戰' : '單人闖關',
    record.score,
    record.correct,
    record.total,
    record.seconds,
    record.matchId,
    record.opponentLabel,
    record.weakAreas,
    JSON.stringify(record.answers)
  ]);

  return { record };
}

function getLeaderboard() {
  const records = readScoreRecords_();
  return {
    scores: records.slice().sort(compareScore_).slice(0, 200).map(publicRecord_),
    soloScores: records.filter(record => record.mode !== 'duel').sort(compareScore_).slice(0, 30).map(publicRecord_),
    duelMatches: buildDuelMatches_(records).slice(0, 30)
  };
}

function makePlayer_(input) {
  const className = String(input.className || '').trim();
  const seatNumber = Number(input.seatNumber);
  if (!['601', '602', '603'].includes(className)) throw new Error('請選擇班級。');
  if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 30) throw new Error('請選擇 1 到 30 號的座號。');
  return {
    id: input.id || Utilities.getUuid(),
    className,
    seatNumber,
    label: `${className} 班 ${seatNumber} 號`
  };
}

function sameStudent_(a, b) {
  return a.className === b.className && Number(a.seatNumber) === Number(b.seatNumber);
}

function roomKey_(roomId) {
  return `room:${roomId}`;
}

function cleanupOldRooms_() {
  const props = PropertiesService.getScriptProperties();
  const expiry = Date.now() - 20 * 60 * 1000;
  const all = props.getProperties();
  Object.keys(all).forEach(key => {
    if (key !== WAITING_ROOM_KEY && !key.startsWith('room:')) return;
    try {
      const value = JSON.parse(all[key]);
      if (value.createdAt && value.createdAt < expiry) props.deleteProperty(key);
    } catch (error) {
      props.deleteProperty(key);
    }
  });
}

function getScoreSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SCORE_SHEET_NAME) || spreadsheet.insertSheet(SCORE_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '紀錄ID', '完成時間', '班級', '座號', '學生', '模式', '分數',
      '答對題數', '總題數', '秒數', '對戰編號', '對手', '不熟悉內容', '答題明細'
    ]);
  }
  return sheet;
}

function readScoreRecords_() {
  const values = getScoreSheet_().getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1).filter(row => row[0]).map(row => ({
    id: row[0],
    createdAt: row[1] instanceof Date ? row[1].toISOString() : String(row[1] || ''),
    className: String(row[2] || ''),
    seatNumber: Number(row[3]) || 0,
    player: String(row[4] || ''),
    mode: String(row[5] || '') === '兩人對戰' ? 'duel' : 'solo',
    score: Number(row[6]) || 0,
    correct: Number(row[7]) || 0,
    total: Number(row[8]) || 0,
    seconds: Number(row[9]) || 0,
    matchId: String(row[10] || ''),
    opponentLabel: String(row[11] || ''),
    weakAreas: String(row[12] || ''),
    answers: parseAnswers_(row[13])
  }));
}

function parseAnswers_(value) {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function summarizeWeakAreas_(answers) {
  return [...new Set(answers.filter(answer => !answer.correct).map(answer => answer.area || '').filter(Boolean))].join('、');
}

function publicRecord_(record) {
  return {
    id: record.id,
    className: record.className,
    seatNumber: record.seatNumber,
    player: record.player,
    mode: record.mode,
    score: record.score,
    seconds: record.seconds,
    correct: record.correct,
    total: record.total,
    matchId: record.matchId || null,
    opponentLabel: record.opponentLabel || '',
    createdAt: record.createdAt
  };
}

function compareScore_(a, b) {
  return b.score - a.score || a.seconds - b.seconds || new Date(b.createdAt) - new Date(a.createdAt);
}

function buildDuelMatches_(records) {
  const groups = {};
  records.filter(record => record.mode === 'duel').forEach(record => {
    const key = record.matchId || `legacy-${record.id}`;
    groups[key] = groups[key] || [];
    groups[key].push(publicRecord_(record));
  });

  return Object.keys(groups).map(matchId => {
    const players = groups[matchId].sort(compareScore_);
    const createdAt = players.map(player => player.createdAt).sort((a, b) => new Date(b) - new Date(a))[0];
    return {
      matchId,
      players,
      completed: players.length >= 2,
      combinedScore: players.reduce((sum, player) => sum + player.score, 0),
      totalSeconds: players.reduce((sum, player) => sum + player.seconds, 0),
      createdAt
    };
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return b.combinedScore - a.combinedScore || a.totalSeconds - b.totalSeconds || new Date(b.createdAt) - new Date(a.createdAt);
  });
}
