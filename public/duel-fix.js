state.roomId = null;
state.leaderboardTimerId = null;

installLeaderboardUpgrade();
installHomeWorksheetButton();
loadLeaderboard();

joinMatch = async function joinMatch() {
  startPanel.classList.add("hidden");
  waitingPanel.classList.remove("hidden");
  document.querySelector("#waitingText").textContent = "系統會將已登入的同學隨機配對。";

  const response = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state.player)
  });
  const match = await response.json();
  state.roomId = match.roomId;

  if (match.status === "ready") {
    setOpponent(match.players);
    startGame();
    return;
  }

  state.matchTimerId = setInterval(async () => {
    const poll = await fetch(`/api/match/${match.roomId}`);
    const room = await poll.json();
    if (room.status === "ready") {
      clearInterval(state.matchTimerId);
      state.roomId = room.roomId || match.roomId;
      setOpponent(room.players);
      startGame();
    }
  }, 1600);
};

function setOpponent(players) {
  state.opponent = players.find(player => {
    return player.className !== state.player.className || player.seatNumber !== state.player.seatNumber;
  }) || null;
}

finishGame = async function finishGame() {
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
      matchId: state.roomId,
      opponent: state.opponent,
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
    updateHomeWorksheetState(true);
  } else {
    worksheetButton.classList.add("hidden");
  }

  await loadLeaderboard();
  if (state.mode === "duel") {
    document.querySelector("#resultSummary").textContent += " 排行榜會自動更新，等對手完成後會把兩位成績放在同一列。";
    startDuelLeaderboardRefresh();
  }
};

function startDuelLeaderboardRefresh() {
  clearInterval(state.leaderboardTimerId);
  let refreshCount = 0;
  state.leaderboardTimerId = setInterval(async () => {
    refreshCount += 1;
    await loadLeaderboard();
    if (refreshCount >= 24) clearInterval(state.leaderboardTimerId);
  }, 2500);
}

function installHomeWorksheetButton() {
  if (document.querySelector("#homeWorksheetButton")) return;
  const qrCard = document.querySelector(".qr-card");
  if (!qrCard) return;
  const button = document.createElement("a");
  button.id = "homeWorksheetButton";
  button.className = "ghost-link worksheet-home-link";
  button.href = "/worksheet.html";
  button.target = "_blank";
  button.textContent = "下載個別學習單 PDF";
  qrCard.append(button);
  updateHomeWorksheetState(Boolean(localStorage.getItem("sdgsLastRecord")));
}

function updateHomeWorksheetState(hasRecord) {
  const button = document.querySelector("#homeWorksheetButton");
  if (!button) return;
  button.classList.toggle("is-disabled", !hasRecord);
  button.setAttribute("aria-disabled", hasRecord ? "false" : "true");
  button.title = hasRecord ? "下載最近一次闖關後產生的個別學習單" : "完成一次闖關後，就能下載個別學習單";
}

function installLeaderboardUpgrade() {
  if (!document.querySelector("#leaderboardUpgradeStyles")) {
    const style = document.createElement("style");
    style.id = "leaderboardUpgradeStyles";
    style.textContent = `
      .leaderboard-groups { display: grid; gap: 22px; }
      .leaderboard-group { display: grid; gap: 12px; }
      .leaderboard-group h3 { margin: 0; font-size: 22px; }
      .leaderboard-group-note { margin: -4px 0 0; color: var(--muted); font-size: 14px; }
      .duel-score-list { display: grid; gap: 6px; min-width: 260px; }
      .duel-player-line { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .duel-player-line strong { color: var(--leaf-dark); }
      .duel-waiting { color: var(--muted); font-weight: 700; }
      .worksheet-home-link { margin-top: 10px; }
      .worksheet-home-link.is-disabled { opacity: .62; }
    `;
    document.head.append(style);
  }

  const panel = document.querySelector("#leaderboardPanel");
  if (!panel || document.querySelector("#soloLeaderboardBody")) return;
  const oldTable = panel.querySelector(".table-wrap");
  if (!oldTable) return;
  oldTable.outerHTML = `
    <div class="leaderboard-groups">
      <section class="leaderboard-group" aria-labelledby="soloBoardTitle">
        <h3 id="soloBoardTitle">單人闖關成績</h3>
        <p class="leaderboard-group-note">依分數高低排序，分數相同時用時較短者在前。</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名次</th>
                <th>學生</th>
                <th>分數</th>
                <th>時間</th>
                <th>完成時間</th>
              </tr>
            </thead>
            <tbody id="soloLeaderboardBody"></tbody>
          </table>
        </div>
      </section>

      <section class="leaderboard-group" aria-labelledby="duelBoardTitle">
        <h3 id="duelBoardTitle">兩人對戰成績</h3>
        <p class="leaderboard-group-note">同一場配對的兩位同學會顯示在同一列。</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名次</th>
                <th>對戰組合</th>
                <th>成績結果</th>
                <th>完成時間</th>
              </tr>
            </thead>
            <tbody id="duelLeaderboardBody"></tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

loadLeaderboard = async function loadLeaderboard() {
  installLeaderboardUpgrade();
  const response = await fetch("/api/leaderboard");
  const data = await response.json();
  const soloBody = document.querySelector("#soloLeaderboardBody");
  const duelBody = document.querySelector("#duelLeaderboardBody");
  if (!soloBody || !duelBody) return;

  const soloScores = data.soloScores || (data.scores || []).filter(record => record.mode !== "duel");
  const duelMatches = data.duelMatches || groupDuelMatches((data.scores || []).filter(record => record.mode === "duel"));

  renderSoloLeaderboard(soloBody, soloScores);
  renderDuelLeaderboard(duelBody, duelMatches);
};

function renderSoloLeaderboard(body, records) {
  body.innerHTML = "";
  if (!records.length) {
    body.append(emptyRow(5, "目前還沒有單人闖關成績。"));
    return;
  }

  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(record.player)}</td>
      <td>${record.score}</td>
      <td>${formatTime(record.seconds)}</td>
      <td>${formatDate(record.createdAt)}</td>
    `;
    body.append(row);
  });
}

function renderDuelLeaderboard(body, matches) {
  body.innerHTML = "";
  if (!matches.length) {
    body.append(emptyRow(4, "目前還沒有兩人對戰成績。"));
    return;
  }

  matches.forEach((match, index) => {
    const players = [...match.players].sort((a, b) => b.score - a.score || a.seconds - b.seconds);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatDuelPlayers(players)}</td>
      <td>${formatDuelScores(players)}</td>
      <td>${formatDate(match.createdAt || players[0]?.createdAt)}</td>
    `;
    body.append(row);
  });
}

function groupDuelMatches(records) {
  const groups = new Map();
  records.forEach(record => {
    const key = record.matchId || `legacy-${record.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });

  return [...groups.entries()].map(([matchId, players]) => ({
    matchId,
    players,
    completed: players.length >= 2,
    combinedScore: players.reduce((sum, player) => sum + player.score, 0),
    totalSeconds: players.reduce((sum, player) => sum + player.seconds, 0),
    createdAt: players.map(player => player.createdAt).sort((a, b) => new Date(b) - new Date(a))[0]
  })).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return b.combinedScore - a.combinedScore || a.totalSeconds - b.totalSeconds || new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function formatDuelPlayers(players) {
  const names = players.map(player => escapeHtml(player.player));
  if (names.length >= 2) return `${names[0]} vs ${names[1]}`;
  const opponent = players[0]?.opponentLabel ? ` vs ${escapeHtml(players[0].opponentLabel)}` : "";
  return `${names[0] || "尚未記錄"}${opponent}`;
}

function formatDuelScores(players) {
  const lines = players.map(player => `
    <div class="duel-player-line">
      <strong>${escapeHtml(player.player)}</strong>
      <span>${player.score} 分</span>
      <span>${formatTime(player.seconds)}</span>
    </div>
  `);
  if (players.length < 2) {
    lines.push(`<div class="duel-waiting">等待對手完成後自動合併顯示</div>`);
  }
  return `<div class="duel-score-list">${lines.join("")}</div>`;
}

function emptyRow(colspan, text) {
  const row = document.createElement("tr");
  row.innerHTML = `<td colspan="${colspan}">${text}</td>`;
  return row;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-TW", { hour12: false });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
