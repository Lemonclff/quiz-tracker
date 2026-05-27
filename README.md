# 🧪 魔法學園 — 即時答題追蹤系統

> 學生答題 → 自動送到 Google Sheets → 老師即時查看全班紀錄

## 🌐 遊戲網址

| 遊戲 | 網址 | 關卡 | 題數 |
|------|------|------|------|
| **濃度調配課** (新版) | [concentration-lab.html](https://lemonclff.github.io/quiz-tracker/game/concentration-lab.html) | 3 關 | 4 題 |
| 濃度大挑戰 (舊版) | [magic-school.html](https://lemonclff.github.io/quiz-tracker/game/magic-school.html) | 3 關 | 3 題 |

### 濃度調配課 (新版) 特色

- **完全資料驅動** — 關卡數、每關題數從 `GAME_SETTING` 動態讀取，可自由增減
- **關卡密碼鎖** — 每關完成後需輸入老師設定的密碼才能解鎖下一關
- **反丟失同步** — 全螢幕遮罩 + localStorage 備份 + 最多 5 次自動重試 + 背景補傳
- **雙路雲端備份** — 即時寫入 Google Sheet + 同時累積到 Drive JSON 檔案
- **單題計時 + 提示追蹤** — 每題獨立計時，記錄是否使用提示
- **12 欄位完整數據** — 比舊版多 3 個分析維度 (gameTitle, questionNo, levelType)

| 密碼 | 關卡 |
|------|------|
| `magic123` | 第 1 關 → 第 2 關 |
| `lucky777` | 第 2 關 → 第 3 關 |
| `clear2026` | 第 3 關 → 結算 |

---

## ⚡ 部署步驟

### 1. 建立 Google 試算表

打開 [sheets.new](https://sheets.new)，第一列貼上 12 欄標題：

```
timestamp | studentId | gameTitle | levelNo | questionNo | difficulty | levelType | target | chosen | isCorrect | timeTaken | hintUsed
```

### 2. 部署 Apps Script

1. 試算表 → 擴充功能 → Apps Script
2. 貼上 HTML 檔案結尾註解區塊 (`<!-- ... -->`) 內的完整 GAS 程式碼
3. 部署 → 新增部署 → 網頁應用程式（執行身分：我，存取：任何人）
4. **複製部署網址**

### 3. 設定遊戲

編輯 `game/concentration-lab.html`，搜尋 `WEB_APP_URL`，換成你的 Apps Script 網址：

```javascript
const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

然後 push：

```bash
git add game/concentration-lab.html && git commit -m "update WEB_APP_URL" && git push
```

### 4. 開始使用

學生打開遊戲網址 → 輸入座號-姓名（如 `12-林小華`）→ 開始答題，數據自動記錄。

---

## 📁 檔案

| 檔案 | 用途 |
|------|------|
| `backend/Code.gs` | GAS 後端 (舊版 9 欄位，對應 magic-school.html) |
| `game/magic-school.html` | 舊版遊戲 (9 欄位) |
| `game/concentration-lab.html` | **新版遊戲 (12 欄位 + 雙路備份)**，內含 GAS 程式碼於註解中 |
| `SETUP_GUIDE.md` | 圖文步驟教學 |
