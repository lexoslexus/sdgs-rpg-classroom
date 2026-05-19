# SDGs 綠色守護者 RPG

這是一個給國小六年級社會領域使用的 SDGs 環境教育 RPG 小遊戲。學生可用平板掃描首頁 QR code 進入，選擇班級、座號，進行單人闖關或兩人隨機配對對戰。

## 功能

- 首頁 QR code 與登入連結
- 班級選單：601、602、603
- 座號選單：1-30 號
- 單人闖關與兩人隨機配對
- 每局從 50 題中隨機抽 20 題
- 成績寫入後端資料
- 可同步寫入 Google 試算表
- 排行榜即時呈現
- 產生個別學生學習單 PDF
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
- Google 試算表同步：請依照 `GOOGLE_SHEETS_SETUP.md` 設定 Apps Script，並把 Web App 網址填入環境變數 `GOOGLE_SHEET_WEBHOOK_URL`

## Google 試算表

本專案已提供：

- `google-apps-script-score-webhook.js`：貼到 Google 試算表的 Apps Script 程式
- `GOOGLE_SHEETS_SETUP.md`：老師可照著操作的設定步驟

設定完成後，每次學生完成遊戲，成績會同步寫入 Google 試算表的 `成績紀錄` 工作表。
