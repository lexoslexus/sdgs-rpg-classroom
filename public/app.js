const QUESTIONS = window.SDGS_QUESTIONS || [];

const state = {
  mode: "solo",
  player: null,
  opponent: null,
  questions: [],
  index: 0,
  answers: [],
  startedAt: 0,
  timerId: null,
  matchTimerId: null
};

const seats = document.querySelector("#seatNumber");
const startPanel = document.querySelector("#startPanel");
const waitingPanel = document.querySelector("#waitingPanel");
const gamePanel = document.querySelector("#gamePanel");
const resultPanel = document.querySelector("#resultPanel");
const leaderboardPanel = document.querySelector("#leaderboardPanel");

for (let seat = 1; seat <= 30; seat += 1) {
  const option = document.createElement("option");
  option.value = String(seat);
  option.textContent = `${seat} 號`;
  seats.append(option);
}

document.querySelectorAll(".mode-button").forEach(button => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll(".mode-button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelector("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  state.player = {
    className: document.querySelector("#className").value,
    seatNumber: Number(document.querySelector("#seatNumber").value)
  };
  if (state.mode === "duel") {
    joinMatch();
  } else {
    startGame();
  }
});

document.querySelector("#restartButton").addEventListener("click", () => {
  resultPanel.classList.add("hidden");
  startPanel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#showBoardButton").addEventListener("click", () => {
  leaderboardPanel.scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#refreshBoardButton").addEventListener("click", loadLeaderboard);

async function setupQrCode() {
  const response = await fetch("/api/config");
  const config = await response.json();
  const publicUrl = config.url && !config.url.includes("localhost") && !config.url.includes("://10.") && !config.url.includes("://172.");
  const bestUrl = publicUrl
    ? config.url
    : config.networkUrls.find(url => !url.includes("localhost")) || config.url;
  document.querySelector("#joinUrl").textContent = bestUrl;
  document.querySelector("#qrImage").src =
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(bestUrl)}`;
}

async function joinMatch() {
  startPanel.classList.add("hidden");
  waitingPanel.classList.remove("hidden");
  document.querySelector("#waitingText").textContent = "系統會將已登入的同學隨機配對。";

  const response = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state.player)
  });
  const match = await response.json();

  if (match.status === "ready") {
    state.opponent = match.players.find(player => {
      return player.className !== state.player.className || player.seatNumber !== state.player.seatNumber;
    });
    startGame();
    return;
  }

  state.matchTimerId = setInterval(async () => {
    const poll = await fetch(`/api/match/${match.roomId}`);
    const room = await poll.json();
    if (room.status === "ready") {
      clearInterval(state.matchTimerId);
      state.opponent = room.players.find(player => {
        return player.className !== state.player.className || player.seatNumber !== state.player.seatNumber;
      });
      startGame();
    }
  }, 1600);
}

function startGame() {
  clearInterval(state.timerId);
  waitingPanel.classList.add("hidden");
  startPanel.classList.add("hidden");
  resultPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");

  state.questions = shuffle(QUESTIONS).slice(0, 20);
  state.index = 0;
  state.answers = [];
  state.startedAt = Date.now();

  document.querySelector("#modeBadge").textContent = state.mode === "duel" ? "兩人對戰" : "單人闖關";
  document.querySelector("#missionTitle").textContent =
    state.mode === "duel" && state.opponent
      ? `對戰：${state.opponent.label || `${state.opponent.className} 班 ${state.opponent.seatNumber} 號`}`
      : "永續島跳跳闖關 20 題";
  document.querySelector("#playerLabel").textContent = `${state.player.className} 班 ${state.player.seatNumber} 號`;

  buildMap();
  renderQuestion();
  state.timerId = setInterval(updateTimer, 1000);
  updateTimer();
}

function buildMap() {
  const track = document.querySelector("#mapTrack");
  track.innerHTML = "";
  for (let i = 0; i < 20; i += 1) {
    const node = document.createElement("div");
    node.className = i % 5 === 4 ? "map-node pollution" : "map-node question-block";
    node.style.left = `${(i / 19) * 100}%`;
    node.style.bottom = `${i % 3 === 1 ? 70 : i % 3 === 2 ? 118 : 28}px`;
    node.setAttribute("aria-label", `第 ${i + 1} 題關卡`);
    track.append(node);
  }
}

function renderQuestion() {
  const item = state.questions[state.index];
  document.querySelector("#questionProgress").textContent = `${state.index + 1} / 20`;
  document.querySelector("#questionMeta").textContent = item.area;
  document.querySelector("#questionText").textContent = item.question;
  document.querySelector("#feedback").textContent = "";

  const answers = document.querySelector("#answers");
  answers.innerHTML = "";
  item.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(optionIndex));
    answers.append(button);
  });

  moveHero();
  markCurrentNode();
}

function chooseAnswer(optionIndex) {
  const item = state.questions[state.index];
  const buttons = [...document.querySelectorAll(".answer-button")];
  buttons.forEach(button => {
    button.disabled = true;
  });

  const correct = optionIndex === item.answer;
  buttons[item.answer].classList.add("correct");
  if (!correct) buttons[optionIndex].classList.add("wrong");

  state.answers.push({
    area: item.area,
    question: item.question,
    selected: item.options[optionIndex],
    correctAnswer: item.options[item.answer],
    correct,
    explain: item.explain
  });

  document.querySelector("#feedback").textContent = `${correct ? "答對了！" : "再想想。"}${item.explain}`;
  const currentNode = document.querySelectorAll(".map-node")[state.index];
  currentNode.classList.remove("current", "question-block", "pollution");
  currentNode.classList.add("done");
  playHeroReaction(correct);

  setTimeout(() => {
    state.index += 1;
    if (state.index >= state.questions.length) {
      finishGame();
    } else {
      renderQuestion();
    }
  }, 950);
}

function moveHero() {
  const token = document.querySelector("#heroToken");
  const progress = state.index / 19;
  const left = 30 + progress * 88;
  token.style.left = `${left}%`;
}

function markCurrentNode() {
  document.querySelectorAll(".map-node").forEach((node, nodeIndex) => {
    node.classList.toggle("current", nodeIndex === state.index);
  });
}

function playHeroReaction(correct) {
  const token = document.querySelector("#heroToken");
  token.classList.remove("jump", "bump");
  void token.offsetWidth;
  token.classList.add(correct ? "jump" : "bump");
}

async function finishGame() {
  clearInterval(state.timerId);
  gamePanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");

  const correct = state.answers.filter(answer => answer.correct).length;
  const seconds = Math.round((Date.now() - state.startedAt) / 1000);
  const score = correct * 5;

  document.querySelector("#resultTitle").textContent =
    score >= 85 ? "永續島成功守護！" : score >= 60 ? "任務完成，繼續升級！" : "任務完成，準備再挑戰！";
  document.querySelector("#resultSummary").textContent =
    `${state.player.className} 班 ${state.player.seatNumber} 號，答對 ${correct} / 20 題，得分 ${score} 分，用時 ${formatTime(seconds)}。`;

  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      className: state.player.className,
      seatNumber: state.player.seatNumber,
      mode: state.mode,
      score,
      seconds,
      answers: state.answers
    })
  });
  const saved = await response.json();
  const worksheetButton = document.querySelector("#worksheetButton");
  if (saved.record && saved.record.id) {
    localStorage.setItem("sdgsLastRecord", JSON.stringify(saved.record));
    worksheetButton.classList.remove("hidden");
    worksheetButton.setAttribute("href", "/worksheet.html");
  } else {
    worksheetButton.classList.add("hidden");
  }
  await loadLeaderboard();
}

async function loadLeaderboard() {
  const response = await fetch("/api/leaderboard");
  const data = await response.json();
  const body = document.querySelector("#leaderboardBody");
  body.innerHTML = "";

  if (!data.scores.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">目前還沒有成績，完成一場任務後就會出現在這裡。</td>`;
    body.append(row);
    return;
  }

  data.scores.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record.player}</td>
      <td>${record.mode === "duel" ? "兩人對戰" : "單人闖關"}</td>
      <td>${record.score}</td>
      <td>${formatTime(record.seconds)}</td>
      <td>${new Date(record.createdAt).toLocaleString("zh-TW", { hour12: false })}</td>
    `;
    body.append(row);
  });
}

function updateTimer() {
  const seconds = Math.round((Date.now() - state.startedAt) / 1000);
  document.querySelector("#timer").textContent = formatTime(seconds);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function shuffle(items) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

setupQrCode().catch(() => {
  document.querySelector("#joinUrl").textContent = window.location.href;
});
loadLeaderboard();
