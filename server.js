const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
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
  ".svg": "image/svg+xml; charset=utf-8"
};

const rooms = new Map();

function ensureData() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(SCORES_FILE)) fs.writeFileSync(SCORES_FILE, "[]\n", "utf8");
  if (!fs.existsSync(SCORES_CSV_FILE)) {
    fs.writeFileSync(
      SCORES_CSV_FILE,
      "createdAt,className,seatNumber,player,mode,score,correct,total,seconds\n",
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
    record.seconds
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
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  const forwardedHost = req.headers["x-forwarded-host"];
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || `localhost:${PORT}`;
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || (host.includes("localhost") ? "http" : "https");
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

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/config") {
    return sendJson(res, 200, { url: publicUrl(req), networkUrls: localNetworkUrls() });
  }

  if (req.method === "GET" && req.url === "/api/leaderboard") {
    const scores = readScores()
      .sort((a, b) => b.score - a.score || a.seconds - b.seconds || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);
    return sendJson(res, 200, { scores });
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

  if (req.method === "POST" && req.url === "/api/scores") {
    const body = await readBody(req);
    const className = String(body.className || "").trim();
    const seatNumber = Number(body.seatNumber);
    const mode = body.mode === "duel" ? "duel" : "solo";
    const score = Number(body.score);
    const seconds = Number(body.seconds);
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!["601", "602", "603"].includes(className) || !Number.isInteger(seatNumber)) {
      return sendJson(res, 400, { error: "學生資料不完整。" });
    }

    const record = {
      id: crypto.randomUUID(),
      className,
      seatNumber,
      player: `${className} 班 ${seatNumber} 號`,
      mode,
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
    return sendJson(res, 201, { record });
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
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
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
});
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
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
  ".svg": "image/svg+xml; charset=utf-8"
};

const rooms = new Map();

function ensureData() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(SCORES_FILE)) fs.writeFileSync(SCORES_FILE, "[]\n", "utf8");
  if (!fs.existsSync(SCORES_CSV_FILE)) {
    fs.writeFileSync(
      SCORES_CSV_FILE,
      "createdAt,className,seatNumber,player,mode,score,correct,total,seconds\n",
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
    record.seconds
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
  const host = req.headers.host || `localhost:${PORT}`;
  return `http://${host}`;
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

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/config") {
    return sendJson(res, 200, { url: publicUrl(req), networkUrls: localNetworkUrls() });
  }

  if (req.method === "GET" && req.url === "/api/leaderboard") {
    const scores = readScores()
      .sort((a, b) => b.score - a.score || a.seconds - b.seconds || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);
    return sendJson(res, 200, { scores });
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

  if (req.method === "POST" && req.url === "/api/scores") {
    const body = await readBody(req);
    const className = String(body.className || "").trim();
    const seatNumber = Number(body.seatNumber);
    const mode = body.mode === "duel" ? "duel" : "solo";
    const score = Number(body.score);
    const seconds = Number(body.seconds);
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!["601", "602", "603"].includes(className) || !Number.isInteger(seatNumber)) {
      return sendJson(res, 400, { error: "學生資料不完整。" });
    }

    const record = {
      id: crypto.randomUUID(),
      className,
      seatNumber,
      player: `${className} 班 ${seatNumber} 號`,
      mode,
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
    return sendJson(res, 201, { record });
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
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
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
});
