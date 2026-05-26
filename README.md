# 魔法學園 — 即時答題追蹤系統

學生答題 → 自動送到 Google Sheets → 老師即時查看全班紀錄

## ⚡ 部署步驟（看 SETUP_GUIDE.md 有圖文版）

1. 建立 Google 試算表，第一列貼上標題
2. 擴充功能 → Apps Script → 貼上 `backend/Code.gs` → 部署為網頁應用程式
3. 把部署網址貼到 `game/magic-school.html` 第 276 行的 `SCRIPT_URL`
4. 把 `game/` 資料夾部署到任何靜態託管

## 📁 檔案

| 檔案 | 用途 |
|------|------|
| `backend/Code.gs` | Google Apps Script（貼到 sheets） |
| `game/magic-school.html` | 遊戲本體（學生開這個） |
| `SETUP_GUIDE.md` | 圖文步驟教學 |
