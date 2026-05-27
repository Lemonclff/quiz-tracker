# 🖼️ 圖文設定教學

> 以下對應 README 的部署步驟，附上畫面說明。

---

## 遊戲選擇

本專案包含兩個遊戲：

| 遊戲 | 檔案 | 欄位數 | 特色 |
|------|------|--------|------|
| **濃度調配課** (新版) | `concentration-lab.html` | 12 欄位 | 關卡密碼鎖、反丟失同步、雙路備份(Sheet+Drive JSON) |
| 濃度大挑戰 (舊版) | `magic-school.html` | 9 欄位 | 基礎答題追蹤 |

> 以下以新版「濃度調配課」為主說明，舊版請參考對應的 `backend/Code.gs`。

---

## 步驟 1：建立試算表

1. 瀏覽器打開 **sheets.new**
2. 看到空白試算表
3. 雙擊左下角工作表名稱 → 改名為 `學習紀錄`
4. 在第一列（A1 到 L1）依序填入 12 欄標題：

```
A1: timestamp
B1: studentId
C1: gameTitle
D1: levelNo
E1: questionNo
F1: difficulty
G1: levelType
H1: target
I1: chosen
J1: isCorrect
K1: timeTaken
L1: hintUsed
```

完成後畫面：

```
┌──────────┬──────────┬──────────┬───────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│timestamp │studentId │gameTitle │levelNo│questionNo│difficulty│levelType │ target   │ chosen   │isCorrect │timeTaken │hintUsed  │
├──────────┼──────────┼──────────┼───────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│          │          │          │       │          │          │          │          │          │          │          │          │
```

> ⚠️ GAS 後端會自動建立工作表與標題列，若想手動建立也行。

---

## 步驟 2：部署 Apps Script

### 2a. 打開編輯器
試算表上方選單 → **擴充功能** → **Apps Script**

### 2b. 貼上程式碼
1. 刪除編輯器內所有預設文字
2. 打開 `game/concentration-lab.html`
3. 捲到最底部，找到 `<!-- Google Apps Script 後端程式碼 -->` 區塊
4. 複製 `// ---- 設定區 ----` 到 `// GAS 程式碼結束` 之間的所有程式碼
5. 在 Apps Script 編輯器貼上 (Ctrl+V)
6. 點上方 💾 儲存圖示

### 2c. 部署
1. 點右上角藍色按鈕 **部署 → 新增部署**
2. 左側齒輪圖示旁下拉選單 → 選擇 **網頁應用程式**
3. 設定：
   - 描述：`魔法學園後端`（可自訂）
   - 執行身分：**我**
   - 誰可以存取：**任何人**
4. 點 **部署** 按鈕
5. 授權畫面 → 選擇你的 Google 帳號 → 允許
6. **複製出現的網址**（格式：`https://script.google.com/macros/s/xxxxx/exec`）

> ⚠️ 這個網址只會出現一次，請務必複製並存好！

### 2d. 授權 Drive 寫入
第一次執行時，GAS 會要求授權 `DriveApp` 權限（用來建立/寫入 `all_students_logs.json`）。部署後若收到授權錯誤，請在 GAS 編輯器中手動執行一次 `doGet` 函式來觸發授權流程。

---

## 步驟 3：設定遊戲 HTML

1. 打開 `game/concentration-lab.html`
2. 搜尋 `WEB_APP_URL`（Ctrl+F）
3. 找到這行（約第 588 行）：
   ```javascript
   const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
4. 把網址換成步驟 2 複製的部署網址
5. 存檔

---

## 步驟 4：發佈遊戲

### 選項 A：GitHub Pages（推薦，免費永久）

```bash
cd quiz-tracker
git add .
git commit -m "update WEB_APP_URL"
git push origin main
```

GitHub Pages 會自動部署，網址格式：
```
https://YOUR_USERNAME.github.io/quiz-tracker/game/concentration-lab.html
```

### 選項 B：Netlify Drop（最簡單）

1. 打開 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把 `game/` 資料夾直接拖進去
3. 自動部署，獲得網址

### 選項 C：本地測試

直接雙擊 `concentration-lab.html` 用瀏覽器打開。本地模式會自動跳過真實傳輸（console 顯示 `[測試模式]`）。

---

## ✅ 驗證

1. 打開遊戲網頁，輸入班級座號 `1C32`
2. 答幾題
3. 回到 Google 試算表 → 重新整理 (F5) → 應該看到 12 欄資料一行一行出現
4. 到 Google Drive → `魔法學園_數據備份` 資料夾 → 打開 `all_students_logs.json` → 應該看到陣列累積的完整紀錄

---

## 🔄 修改遊戲後如何更新？

- **GitHub Pages**：`git add . && git commit -m "update" && git push`
- **Netlify**：重新拖曳覆蓋
- **本地**：直接存檔即可

---

## 🎮 如何自訂關卡與題目

編輯 `concentration-lab.html`，找到頂部的 `const GAME_SETTING`：

```javascript
const GAME_SETTING = {
  "gameTitle": "魔法學園：濃度調配課",
  "levels": [
    {
      "levelNo": 1,
      "difficulty": "簡單",
      "levelType": "百分率 (%)",
      "nextLevelPassword": "magic123",   // ← 學生需輸入此密碼才能進下一關
      "questions": [
        {
          "questionNo": 1,
          "question": "題目文字...",
          "target": "題目目標描述",
          "options": ["選項A", "選項B", "選項C", "選項D"],
          "correctIndex": 1,              // 0=A, 1=B, 2=C, 3=D
          "hint": "顯示給學生的提示文字"
        },
        // 可在同一關增加任意數量題目，系統自動計算
      ]
    },
    // 可增加任意數量關卡
  ]
};
```

系統會自動：
- 計算總題數並更新進度條
- 在每關最後一題後彈出密碼驗證
- 動態渲染所有關卡與題目

**無需修改任何其他程式碼。**
