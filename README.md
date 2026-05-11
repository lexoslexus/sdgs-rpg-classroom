# SDGs 綠色守護者 RPG

這是一個給國小六年級社會領域使用的 SDGs 環境教育 RPG 小遊戲。學生可用平板掃描首頁 QR code 進入，選擇班級、座號，進行單人闖關或兩人隨機配對對戰。

## 功能

- 首頁 QR code 與登入連結
- 班級選單：提601、提602、提603
- 座號選單：1-30 號
- 單人闖關與兩人隨機配對
- 每局 20 題 SDGs 與環境教育題目
- 成績寫入後端資料
- 排行榜即時呈現
- 同步產生 `data/scores.csv`，可用 Excel 或 Google 試算表開啟

## 啟動

```bash
npm start
```

啟動後，老師電腦可打開：

```text
http://localhost:3000
```

學生平板需和老師電腦在同一個網路，使用首頁顯示的區域網路網址或 QR code 進入。

## 成績資料

- `data/scores.json`：排行榜與完整答題紀錄使用
- `data/scores.csv`：試算表格式成績，可直接匯入 Excel 或 Google 試算表

若之後要改接 Google Sheets API，可以把 `server.js` 裡 `/api/scores` 的寫入段落換成 Google Sheets append row。
