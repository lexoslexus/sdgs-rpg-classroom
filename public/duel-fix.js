state.roomId = null;
state.leaderboardTimerId = null;

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
  } else {
    worksheetButton.classList.add("hidden");
  }

  await loadLeaderboard();
  if (state.mode === "duel") {
    document.querySelector("#resultSummary").textContent += " 排行榜會自動更新，等待對手完成後會顯示兩位成績。";
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

loadLeaderboard = async function loadLeaderboard() {
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
    const duelText = record.mode === "duel" && record.opponentLabel
      ? `兩人對戰（對手：${record.opponentLabel}）`
      : record.mode === "duel" ? "兩人對戰" : "單人闖關";
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record.player}</td>
      <td>${duelText}</td>
      <td>${record.score}</td>
      <td>${formatTime(record.seconds)}</td>
      <td>${new Date(record.createdAt).toLocaleString("zh-TW", { hour12: false })}</td>
    `;
    body.append(row);
  });
};
