# 🧪 魔法學園 — 即時答題追蹤系統

> 學生答題 → 自動送到 Google Sheets → 老師即時查看全班紀錄

## 🌐 遊戲網址

```
https://lemonclff.github.io/quiz-tracker/game/magic-school.html
```

## ⚡ 部署步驟

### 1. 建立 Google 試算表
打開 [sheets.new](https://sheets.new)，第一列貼上標題：
```
學生座號 | 時間 | 關卡 | 題型 | 目標濃度 | 正確與否 | 所選答案 | 答題時間(秒) | 是否使用提示
```

### 2. 部署 Apps Script
1. 試算表 → 擴充功能 → Apps Script
2. 貼上 `backend/Code.gs` 全部內容
3. 部署 → 新增部署 → 網頁應用程式（執行身分：我，存取：任何人）
4. **複製部署網址**

### 3. 設定遊戲
編輯 `game/magic-school.html`，把第 276 行的 `SCRIPT_URL` 換成你的 Apps Script 網址，然後 push：

```bash
git add game/magic-school.html && git commit -m "update SCRIPT_URL" && git push
```

### 4. 開始使用
學生打開遊戲網址，第一次輸入座號，之後答題自動記錄到你的試算表。

## 📁 檔案

| 檔案 | 用途 |
|------|------|
| `backend/Code.gs` | Google Apps Script（貼到 sheets 的擴充功能） |
| `game/magic-school.html` | 遊戲本體（部署到 GitHub Pages） |
| `SETUP_GUIDE.md` | 圖文步驟教學 |
