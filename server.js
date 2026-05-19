const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_URL || "";
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const SCORES_FILE = path.join(DATA, "scores.json");
const SCORES_CSV_FILE = path.join(DATA, "scores.csv");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".b64": "text/plain; charset=utf-8",
  ".mp4": "video/mp4"
};

const rooms = new Map();

function ensureData() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(SCORES_FILE)) fs.writeFileSync(SCORES_FILE, "[]\n", "utf8");
  if (!fs.existsSync(SCORES_CSV_FILE)) {
    fs.writeFileSync(
      SCORES_CSV_FILE,
      "createdAt,className,seatNumber,player,mode,score,correct,total,seconds,matchId,opponent\n",
      "utf8"
    );
  }
}

function readScores() {
  ensureData();
  try {
    const parsed = JSON.parse(fs.readFileSync(SCORES_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeScores(scores) {
  ensureData();
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2) + "\n", "utf8");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function appendScoreCsv(record) {
  ensureData();
  const row = [
    record.createdAt,
    record.className,
    record.seatNumber,
    record.player,
    record.mode,
    record.score,
    record.correct,
    record.total,
    record.seconds,
    record.matchId || "",
    record.opponentLabel || ""
  ].map(csvCell).join(",");
  fs.appendFileSync(SCORES_CSV_FILE, `${row}\n`, "utf8");
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json)
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function publicUrl(req) {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/^http:/, "https:");
  }
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || `localhost:${PORT}`;
  const protocol = host.includes("localhost") || host.startsWith("10.") || host.startsWith("172.")
    ? "http"
    : "https";
  return `${protocol}://${host}`;
}

function localNetworkUrls() {
  const urls = [`http://localhost:${PORT}`];
  const nets = os.networkInterfaces();
  for (const items of Object.values(nets)) {
    for (const item of items || []) {
      if (item.family === "IPv4" && !item.internal) {
        urls.push(`http://${item.address}:${PORT}`);
      }
    }
  }
  return [...new Set(urls)];
}

function makePlayer(body) {
  const className = String(body.className || "").trim();
  const seatNumber = Number(body.seatNumber);
  if (!["601", "602", "603"].includes(className)) {
    return { error: "請選擇班級。" };
  }
  if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 30) {
    return { error: "請選擇 1 到 30 號的座號。" };
  }
  return {
    id: crypto.randomUUID(),
    className,
    seatNumber,
    label: `${className} 班 ${seatNumber} 號`
  };
}

function cleanupRooms() {
  const expiry = Date.now() - 20 * 60 * 1000;
  for (const [id, room] of rooms.entries()) {
    if (room.createdAt < expiry) rooms.delete(id);
  }
}

function handleMatch(player) {
  cleanupRooms();
  for (const [id, room] of rooms.entries()) {
    if (room.status === "waiting" && room.players[0].id !== player.id) {
      room.players.push(player);
      room.status = "ready";
      return { roomId: id, status: "ready", players: room.players };
    }
  }
  const roomId = crypto.randomUUID();
  rooms.set(roomId, {
    roomId,
    status: "waiting",
    players: [player],
    createdAt: Date.now()
  });
  return { roomId, status: "waiting", players: [player] };
}

function publicRecord(record) {
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
    opponentLabel: record.opponentLabel || "",
    createdAt: record.createdAt
  };
}

function compareScore(a, b) {
  return b.score - a.score || a.seconds - b.seconds || new Date(b.createdAt) - new Date(a.createdAt);
}

function duelGroupKey(record) {
  return record.matchId || `legacy-${record.id}`;
}

function buildDuelMatches(records) {
  const groups = new Map();
  for (const record of records.filter(item => item.mode === "duel")) {
    const key = duelGroupKey(record);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(publicRecord(record));
  }

  return [...groups.entries()].map(([matchId, players]) => {
    const sortedPlayers = players.sort(compareScore);
    const createdAt = sortedPlayers
      .map(player => player.createdAt)
      .sort((a, b) => new Date(b) - new Date(a))[0];
    return {
      matchId,
      players: sortedPlayers,
      completed: sortedPlayers.length >= 2,
      combinedScore: sortedPlayers.reduce((sum, player) => sum + player.score, 0),
      bestScore: sortedPlayers[0]?.score || 0,
      totalSeconds: sortedPlayers.reduce((sum, player) => sum + player.seconds, 0),
      createdAt
    };
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return b.combinedScore - a.combinedScore || a.totalSeconds - b.totalSeconds || new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function summarizeWeakAreas(answers) {
  const missedAreas = answers
    .filter(answer => !answer.correct)
    .map(answer => answer.area || answer.topic || answer.category || "")
    .filter(Boolean);
  return [...new Set(missedAreas)].join("、");
}

function sheetRecord(record) {
  return {
    createdAt: record.createdAt,
    className: record.className,
    seatNumber: record.seatNumber,
    player: record.player,
    mode: record.mode === "duel" ? "兩人對戰" : "單人闖關",
    score: record.score,
    correct: record.correct,
    total: record.total,
    seconds: record.seconds,
    matchId: record.matchId || "",
    opponent: record.opponentLabel || "",
    weakAreas: summarizeWeakAreas(record.answers || []),
    answers: record.answers || []
  };
}

function postJsonWithRedirects(urlString, payload, redirects = 0) {
  return new Promise(resolve => {
    let target;
    try {
      target = new URL(urlString);
    } catch (error) {
      resolve({ enabled: true, ok: false, error: `Google 試算表網址格式錯誤：${error.message}` });
      return;
    }

    const text = JSON.stringify(payload);
    const transport = target.protocol === "http:" ? http : https;
    const request = transport.request(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(text)
      }
    }, response => {
      let body = "";
      response.on("data", chunk => { body += chunk; });
      response.on("end", () => {
        const status = response.statusCode || 0;
        const isRedirect = [301, 302, 303, 307, 308].includes(status);
        if (isRedirect && response.headers.location && redirects < 3) {
          resolve(postJsonWithRedirects(new URL(response.headers.location, target).toString(), payload, redirects + 1));
          return;
        }
        resolve({
          enabled: true,
          ok: status >= 200 && status < 300,
          status,
          body: body.slice(0, 300)
        });
      });
    });

    request.on("error", error => {
      resolve({ enabled: true, ok: false, error: error.message });
    });
    request.setTimeout(8000, () => {
      request.destroy(new Error("Google 試算表寫入逾時。"));
    });
    request.write(text);
    request.end();
  });
}

async function postScoreToGoogleSheet(record) {
  if (!GOOGLE_SHEET_WEBHOOK_URL) return { enabled: false, ok: false };
  return postJsonWithRedirects(GOOGLE_SHEET_WEBHOOK_URL, {
    type: "score",
    record: sheetRecord(record)
  });
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/config") {
    return sendJson(res, 200, { url: publicUrl(req), networkUrls: localNetworkUrls() });
  }

  if (req.method === "GET" && req.url === "/api/leaderboard") {
    const allScores = readScores();
    const scores = [...allScores].sort(compareScore).slice(0, 200).map(publicRecord);
    const soloScores = allScores.filter(record => record.mode !== "duel").sort(compareScore).slice(0, 30).map(publicRecord);
    const duelMatches = buildDuelMatches(allScores).slice(0, 30);
    return sendJson(res, 200, { scores, soloScores, duelMatches });
  }

  if (req.method === "POST" && req.url === "/api/match") {
    const body = await readBody(req);
    const player = makePlayer(body);
    if (player.error) return sendJson(res, 400, { error: player.error });
    return sendJson(res, 200, handleMatch(player));
  }

  if (req.method === "GET" && req.url.startsWith("/api/match/")) {
    cleanupRooms();
    const roomId = decodeURIComponent(req.url.split("/").pop());
    const room = rooms.get(roomId);
    if (!room) return sendJson(res, 404, { error: "配對已逾時，請重新排隊。" });
    return sendJson(res, 200, { roomId, status: room.status, players: room.players });
  }

  if (req.method === "GET" && req.url.startsWith("/api/match-results/")) {
    const matchId = decodeURIComponent(req.url.split("/").pop());
    const scores = readScores()
      .filter(record => record.matchId === matchId)
      .sort(compareScore)
      .map(publicRecord);
    return sendJson(res, 200, { matchId, scores });
  }

  if (req.method === "POST" && req.url === "/api/scores") {
    const body = await readBody(req);
    const className = String(body.className || "").trim();
    const seatNumber = Number(body.seatNumber);
    const mode = body.mode === "duel" ? "duel" : "solo";
    const score = Number(body.score);
    const seconds = Number(body.seconds);
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const matchId = mode === "duel" && typeof body.matchId === "string" && body.matchId ? body.matchId : null;
    const opponent = body.opponent && typeof body.opponent === "object" ? body.opponent : null;
    const opponentLabel = opponent
      ? opponent.label || `${opponent.className} 班 ${opponent.seatNumber} 號`
      : "";

    if (!["601", "602", "603"].includes(className) || !Number.isInteger(seatNumber)) {
      return sendJson(res, 400, { error: "學生資料不完整。" });
    }

    const record = {
      id: crypto.randomUUID(),
      className,
      seatNumber,
      player: `${className} 班 ${seatNumber} 號`,
      mode,
      matchId,
      opponentLabel,
      score: Number.isFinite(score) ? score : 0,
      seconds: Number.isFinite(seconds) ? seconds : 0,
      correct: answers.filter(answer => answer.correct).length,
      total: answers.length,
      answers,
      createdAt: new Date().toISOString()
    };

    const scores = readScores();
    scores.push(record);
    writeScores(scores);
    appendScoreCsv(record);
    const googleSheet = await postScoreToGoogleSheet(record);
    return sendJson(res, 201, { record, googleSheet });
  }

  return false;
}

function serveStatic(req, res) {
  const rawUrl = req.url.split("?")[0];
  const requested = rawUrl === "/" ? "/index.html" : decodeURIComponent(rawUrl);
  const filePath = path.normalize(path.join(PUBLIC, requested));

  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

ensureData();

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      const handled = await handleApi(req, res);
      if (handled === false) sendJson(res, 404, { error: "API not found." });
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error." });
  }
});

server.listen(PORT, () => {
  console.log(`SDGs RPG is running:`);
  for (const url of localNetworkUrls()) console.log(`- ${url}`);
  if (GOOGLE_SHEET_WEBHOOK_URL) console.log("- Google Sheets score sync is enabled.");
});
