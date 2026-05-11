const QUESTIONS = [
  {
    area: "SDG 6 淨水任務",
    question: "社區河川出現垃圾與油污時，哪一個行動最符合公民參與和環境保護？",
    options: ["只在網路留言抱怨", "通報相關單位並參與淨溪活動", "把垃圾推到下游", "等下雨自然沖走"],
    answer: 1,
    explain: "通報、合作與實際參與，能讓公共問題被看見並被改善。"
  },
  {
    area: "SDG 11 永續城市",
    question: "城市規劃增加公園、行道樹和人行道，最可能帶來哪一項好處？",
    options: ["增加熱島效應", "降低居民活動空間", "改善生活品質與行走安全", "讓雨水完全無法滲入土地"],
    answer: 2,
    explain: "綠地和友善步行環境能改善健康、安全與城市韌性。"
  },
  {
    area: "SDG 12 責任消費",
    question: "學校園遊會想減少一次性垃圾，最適合的做法是什麼？",
    options: ["鼓勵自備餐具與水壺", "每攤都使用塑膠袋", "活動後再全部丟掉", "只要求老師整理"],
    answer: 0,
    explain: "源頭減量比事後處理更有效，也能培養負責任的消費習慣。"
  },
  {
    area: "SDG 13 氣候行動",
    question: "面對極端高溫越來越常見，學校最適合推動哪一項調適行動？",
    options: ["取消所有戶外樹蔭", "建立補水、遮蔭與高溫警示措施", "中午安排最激烈活動", "教室全天開冷氣不管理"],
    answer: 1,
    explain: "氣候調適包含預警、健康照護與環境改善。"
  },
  {
    area: "SDG 14 海洋保育",
    question: "塑膠吸管、塑膠袋流入海洋後，可能造成什麼影響？",
    options: ["幫助珊瑚生長", "變成魚類的天然食物", "傷害海洋生物並進入食物鏈", "讓海水更乾淨"],
    answer: 2,
    explain: "海洋廢棄物會危害生物，也可能透過食物鏈影響人類。"
  },
  {
    area: "SDG 15 陸域生態",
    question: "如果山坡地過度開發，最可能增加哪一種災害風險？",
    options: ["土石流與水土流失", "海嘯", "火山爆發", "日食"],
    answer: 0,
    explain: "植被減少會讓土壤不穩，豪雨時更容易發生災害。"
  },
  {
    area: "社會領域：公共參與",
    question: "班上想改善校園回收分類，最符合民主討論的方式是什麼？",
    options: ["由一個人秘密決定", "蒐集意見、討論方案並分工執行", "誰聲音大就聽誰的", "完全不處理"],
    answer: 1,
    explain: "公共議題需要蒐集資訊、討論、決策與共同承擔。"
  },
  {
    area: "SDG 7 可負擔能源",
    question: "下列哪一種是再生能源？",
    options: ["煤炭", "石油", "太陽能", "天然氣"],
    answer: 2,
    explain: "太陽能可持續取得，使用時也能減少溫室氣體排放。"
  },
  {
    area: "SDG 2 永續糧食",
    question: "購買在地、當季食材，和環境永續有什麼關係？",
    options: ["一定會增加運輸距離", "可能減少運輸排碳並支持在地農業", "會讓食物完全不用保存", "和環境沒有任何關係"],
    answer: 1,
    explain: "在地當季食材通常運輸距離較短，也能支持地方經濟。"
  },
  {
    area: "環境正義",
    question: "為什麼環境污染常被視為社會公平問題？",
    options: ["污染只影響動物", "不同族群承受污染風險可能不平均", "所有人一定感受完全相同", "污染越多越公平"],
    answer: 1,
    explain: "環境利益與風險的分配，會影響不同地區與族群的生活權益。"
  },
  {
    area: "SDG 17 夥伴關係",
    question: "要解決海岸垃圾問題，哪一種合作最有效？",
    options: ["只靠一位學生", "學校、居民、政府和企業一起分工", "把責任推給外地人", "停止所有討論"],
    answer: 1,
    explain: "永續問題通常需要跨團體合作，才能長期改善。"
  },
  {
    area: "水資源",
    question: "日常生活中哪個行為最能節約用水？",
    options: ["刷牙時一直開水", "修理漏水水龍頭", "用飲用水沖操場", "洗手後不關水"],
    answer: 1,
    explain: "修漏和養成關水習慣，是最直接的節水行動。"
  },
  {
    area: "循環經濟",
    question: "回收前先把寶特瓶簡單沖洗、壓扁，主要目的是什麼？",
    options: ["增加臭味", "提高回收品質並節省空間", "讓回收車更難處理", "讓瓶子不能再利用"],
    answer: 1,
    explain: "正確回收能提高後續再製效率。"
  },
  {
    area: "空氣品質",
    question: "空氣品質不佳時，學校最適合提醒學生怎麼做？",
    options: ["照常長時間劇烈運動", "留意空品資訊並調整戶外活動", "打開所有窗戶吹入髒空氣", "不要告訴任何人"],
    answer: 1,
    explain: "依照空品資訊調整活動，是保護健康的重要做法。"
  },
  {
    area: "生物多樣性",
    question: "外來入侵種可能造成什麼問題？",
    options: ["一定增加本土生物棲地", "可能排擠本土物種並改變生態", "讓所有生物和平共存", "和生態完全無關"],
    answer: 1,
    explain: "入侵種可能缺乏天敵，快速繁殖並影響原有生態平衡。"
  },
  {
    area: "防災與韌性",
    question: "颱風來臨前，社區清理水溝落葉主要是為了什麼？",
    options: ["增加淹水風險", "降低排水阻塞與淹水機會", "讓路面更滑", "把垃圾藏起來"],
    answer: 1,
    explain: "防災準備能降低災害發生時的損失。"
  },
  {
    area: "公民行動",
    question: "看到有人在自然步道亂丟垃圾，最適合的做法是什麼？",
    options: ["模仿他", "安全提醒或通報管理單位", "把垃圾踢進草叢", "拍照嘲笑同學"],
    answer: 1,
    explain: "尊重他人、安全處理與通報，才是負責任的公民行動。"
  },
  {
    area: "能源選擇",
    question: "教室沒有人時關燈，除了省電，也代表什麼永續觀念？",
    options: ["資源可以無限浪費", "珍惜能源並減少不必要排碳", "只要電費不是自己付就沒關係", "越亮越環保"],
    answer: 1,
    explain: "節能是每個人都能做到的氣候行動。"
  },
  {
    area: "永續交通",
    question: "短距離移動時，走路、騎腳踏車或搭大眾運輸的好處是什麼？",
    options: ["通常可減少交通排放", "一定會製造更多空污", "完全不能運動", "讓道路更壅塞"],
    answer: 0,
    explain: "低碳交通能減少排放，也改善城市生活品質。"
  },
  {
    area: "社區觀察",
    question: "學生做社區環境調查時，哪一項資料最適合記錄？",
    options: ["自己猜想的數字", "垃圾熱點、行人安全與綠地分布", "同學的私人密碼", "和環境無關的八卦"],
    answer: 1,
    explain: "環境調查要記錄可觀察、可討論、能幫助改善公共生活的資料。"
  },
  {
    area: "SDG 3 健康生活",
    question: "校園附近車流量大時，種樹與設置安全步道可改善什麼？",
    options: ["學生通行安全與環境品質", "讓車子開進操場", "減少所有樹蔭", "增加危險路口"],
    answer: 0,
    explain: "健康、交通安全與環境品質彼此相關。"
  },
  {
    area: "土地利用",
    question: "濕地被稱為重要生態環境，原因之一是什麼？",
    options: ["完全沒有生物", "可提供生物棲地並調節水分", "只能拿來倒垃圾", "會讓水永遠消失"],
    answer: 1,
    explain: "濕地兼具生態、防洪、淨化水質等功能。"
  },
  {
    area: "永續校園",
    question: "學校推動二手制服交換，符合哪一個概念？",
    options: ["延長物品壽命、減少浪費", "鼓勵買更多新衣", "讓資源不能再利用", "把舊衣全部丟棄"],
    answer: 0,
    explain: "重複使用能降低資源消耗，也讓物品價值被延續。"
  },
  {
    area: "氣候與生活",
    question: "用樹蔭、通風與隔熱改善教室炎熱，屬於哪一種思考？",
    options: ["只依賴更多耗能設備", "用環境設計減少能源需求", "讓教室更悶熱", "和氣候無關"],
    answer: 1,
    explain: "良好設計可以先降低能源需求，再搭配必要設備。"
  }
];

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
      : "守護永續島 20 題任務";
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
    node.className = "map-node";
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
    question: item.question,
    selected: item.options[optionIndex],
    correctAnswer: item.options[item.answer],
    correct
  });

  document.querySelector("#feedback").textContent = `${correct ? "答對了！" : "再想想。"}${item.explain}`;
  document.querySelectorAll(".map-node")[state.index].classList.add("done");

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
  if (window.matchMedia("(max-width: 820px)").matches) {
    token.style.left = `${22 + progress * 80}%`;
    token.style.top = "50%";
  } else {
    token.style.top = `${22 + progress * 82}%`;
    token.style.left = "50%";
  }
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

  await fetch("/api/scores", {
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
const QUESTIONS = [
  {
    area: "SDG 6 淨水任務",
    question: "社區河川出現垃圾與油污時，哪一個行動最符合公民參與和環境保護？",
    options: ["只在網路留言抱怨", "通報相關單位並參與淨溪活動", "把垃圾推到下游", "等下雨自然沖走"],
    answer: 1,
    explain: "通報、合作與實際參與，能讓公共問題被看見並被改善。"
  },
  {
    area: "SDG 11 永續城市",
    question: "城市規劃增加公園、行道樹和人行道，最可能帶來哪一項好處？",
    options: ["增加熱島效應", "降低居民活動空間", "改善生活品質與行走安全", "讓雨水完全無法滲入土地"],
    answer: 2,
    explain: "綠地和友善步行環境能改善健康、安全與城市韌性。"
  },
  {
    area: "SDG 12 責任消費",
    question: "學校園遊會想減少一次性垃圾，最適合的做法是什麼？",
    options: ["鼓勵自備餐具與水壺", "每攤都使用塑膠袋", "活動後再全部丟掉", "只要求老師整理"],
    answer: 0,
    explain: "源頭減量比事後處理更有效，也能培養負責任的消費習慣。"
  },
  {
    area: "SDG 13 氣候行動",
    question: "面對極端高溫越來越常見，學校最適合推動哪一項調適行動？",
    options: ["取消所有戶外樹蔭", "建立補水、遮蔭與高溫警示措施", "中午安排最激烈活動", "教室全天開冷氣不管理"],
    answer: 1,
    explain: "氣候調適包含預警、健康照護與環境改善。"
  },
  {
    area: "SDG 14 海洋保育",
    question: "塑膠吸管、塑膠袋流入海洋後，可能造成什麼影響？",
    options: ["幫助珊瑚生長", "變成魚類的天然食物", "傷害海洋生物並進入食物鏈", "讓海水更乾淨"],
    answer: 2,
    explain: "海洋廢棄物會危害生物，也可能透過食物鏈影響人類。"
  },
  {
    area: "SDG 15 陸域生態",
    question: "如果山坡地過度開發，最可能增加哪一種災害風險？",
    options: ["土石流與水土流失", "海嘯", "火山爆發", "日食"],
    answer: 0,
    explain: "植被減少會讓土壤不穩，豪雨時更容易發生災害。"
  },
  {
    area: "社會領域：公共參與",
    question: "班上想改善校園回收分類，最符合民主討論的方式是什麼？",
    options: ["由一個人秘密決定", "蒐集意見、討論方案並分工執行", "誰聲音大就聽誰的", "完全不處理"],
    answer: 1,
    explain: "公共議題需要蒐集資訊、討論、決策與共同承擔。"
  },
  {
    area: "SDG 7 可負擔能源",
    question: "下列哪一種是再生能源？",
    options: ["煤炭", "石油", "太陽能", "天然氣"],
    answer: 2,
    explain: "太陽能可持續取得，使用時也能減少溫室氣體排放。"
  },
  {
    area: "SDG 2 永續糧食",
    question: "購買在地、當季食材，和環境永續有什麼關係？",
    options: ["一定會增加運輸距離", "可能減少運輸排碳並支持在地農業", "會讓食物完全不用保存", "和環境沒有任何關係"],
    answer: 1,
    explain: "在地當季食材通常運輸距離較短，也能支持地方經濟。"
  },
  {
    area: "環境正義",
    question: "為什麼環境污染常被視為社會公平問題？",
    options: ["污染只影響動物", "不同族群承受污染風險可能不平均", "所有人一定感受完全相同", "污染越多越公平"],
    answer: 1,
    explain: "環境利益與風險的分配，會影響不同地區與族群的生活權益。"
  },
  {
    area: "SDG 17 夥伴關係",
    question: "要解決海岸垃圾問題，哪一種合作最有效？",
    options: ["只靠一位學生", "學校、居民、政府和企業一起分工", "把責任推給外地人", "停止所有討論"],
    answer: 1,
    explain: "永續問題通常需要跨團體合作，才能長期改善。"
  },
  {
    area: "水資源",
    question: "日常生活中哪個行為最能節約用水？",
    options: ["刷牙時一直開水", "修理漏水水龍頭", "用飲用水沖操場", "洗手後不關水"],
    answer: 1,
    explain: "修漏和養成關水習慣，是最直接的節水行動。"
  },
  {
    area: "循環經濟",
    question: "回收前先把寶特瓶簡單沖洗、壓扁，主要目的是什麼？",
    options: ["增加臭味", "提高回收品質並節省空間", "讓回收車更難處理", "讓瓶子不能再利用"],
    answer: 1,
    explain: "正確回收能提高後續再製效率。"
  },
  {
    area: "空氣品質",
    question: "空氣品質不佳時，學校最適合提醒學生怎麼做？",
    options: ["照常長時間劇烈運動", "留意空品資訊並調整戶外活動", "打開所有窗戶吹入髒空氣", "不要告訴任何人"],
    answer: 1,
    explain: "依照空品資訊調整活動，是保護健康的重要做法。"
  },
  {
    area: "生物多樣性",
    question: "外來入侵種可能造成什麼問題？",
    options: ["一定增加本土生物棲地", "可能排擠本土物種並改變生態", "讓所有生物和平共存", "和生態完全無關"],
    answer: 1,
    explain: "入侵種可能缺乏天敵，快速繁殖並影響原有生態平衡。"
  },
  {
    area: "防災與韌性",
    question: "颱風來臨前，社區清理水溝落葉主要是為了什麼？",
    options: ["增加淹水風險", "降低排水阻塞與淹水機會", "讓路面更滑", "把垃圾藏起來"],
    answer: 1,
    explain: "防災準備能降低災害發生時的損失。"
  },
  {
    area: "公民行動",
    question: "看到有人在自然步道亂丟垃圾，最適合的做法是什麼？",
    options: ["模仿他", "安全提醒或通報管理單位", "把垃圾踢進草叢", "拍照嘲笑同學"],
    answer: 1,
    explain: "尊重他人、安全處理與通報，才是負責任的公民行動。"
  },
  {
    area: "能源選擇",
    question: "教室沒有人時關燈，除了省電，也代表什麼永續觀念？",
    options: ["資源可以無限浪費", "珍惜能源並減少不必要排碳", "只要電費不是自己付就沒關係", "越亮越環保"],
    answer: 1,
    explain: "節能是每個人都能做到的氣候行動。"
  },
  {
    area: "永續交通",
    question: "短距離移動時，走路、騎腳踏車或搭大眾運輸的好處是什麼？",
    options: ["通常可減少交通排放", "一定會製造更多空污", "完全不能運動", "讓道路更壅塞"],
    answer: 0,
    explain: "低碳交通能減少排放，也改善城市生活品質。"
  },
  {
    area: "社區觀察",
    question: "學生做社區環境調查時，哪一項資料最適合記錄？",
    options: ["自己猜想的數字", "垃圾熱點、行人安全與綠地分布", "同學的私人密碼", "和環境無關的八卦"],
    answer: 1,
    explain: "環境調查要記錄可觀察、可討論、能幫助改善公共生活的資料。"
  },
  {
    area: "SDG 3 健康生活",
    question: "校園附近車流量大時，種樹與設置安全步道可改善什麼？",
    options: ["學生通行安全與環境品質", "讓車子開進操場", "減少所有樹蔭", "增加危險路口"],
    answer: 0,
    explain: "健康、交通安全與環境品質彼此相關。"
  },
  {
    area: "土地利用",
    question: "濕地被稱為重要生態環境，原因之一是什麼？",
    options: ["完全沒有生物", "可提供生物棲地並調節水分", "只能拿來倒垃圾", "會讓水永遠消失"],
    answer: 1,
    explain: "濕地兼具生態、防洪、淨化水質等功能。"
  },
  {
    area: "永續校園",
    question: "學校推動二手制服交換，符合哪一個概念？",
    options: ["延長物品壽命、減少浪費", "鼓勵買更多新衣", "讓資源不能再利用", "把舊衣全部丟棄"],
    answer: 0,
    explain: "重複使用能降低資源消耗，也讓物品價值被延續。"
  },
  {
    area: "氣候與生活",
    question: "用樹蔭、通風與隔熱改善教室炎熱，屬於哪一種思考？",
    options: ["只依賴更多耗能設備", "用環境設計減少能源需求", "讓教室更悶熱", "和氣候無關"],
    answer: 1,
    explain: "良好設計可以先降低能源需求，再搭配必要設備。"
  }
];

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
  const bestUrl = config.networkUrls.find(url => !url.includes("localhost")) || config.url;
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
      : "守護永續島 20 題任務";
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
    node.className = "map-node";
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
    question: item.question,
    selected: item.options[optionIndex],
    correctAnswer: item.options[item.answer],
    correct
  });

  document.querySelector("#feedback").textContent = `${correct ? "答對了！" : "再想想。"}${item.explain}`;
  document.querySelectorAll(".map-node")[state.index].classList.add("done");

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
  if (window.matchMedia("(max-width: 820px)").matches) {
    token.style.left = `${22 + progress * 80}%`;
    token.style.top = "50%";
  } else {
    token.style.top = `${22 + progress * 82}%`;
    token.style.left = "50%";
  }
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

  await fetch("/api/scores", {
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
