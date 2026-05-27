# 🧪 魔法學園 · 魔藥煉成所 — 即時答題追蹤系統

> 學生調配魔藥 → 自動送到 Google Sheets → 教師即時分析全班學習數據

## 🌐 遊戲網址

| 遊戲 | 網址 | 關卡 | 題數 |
|------|------|------|------|
| **魔藥煉成所** (最新) | [concentration-lab.html](https://lemonclff.github.io/quiz-tracker/game/concentration-lab.html) | 3 關 | 12 題 |
| 濃度大挑戰 (舊版) | [magic-school.html](https://lemonclff.github.io/quiz-tracker/game/magic-school.html) | 3 關 | 3 題 |

### 魔藥煉成所 特色

- **材料架多選制** — 從魔法材料架挑選等值配方放入魔藥瓶，非單一選擇題
- **積分 + 稱號系統** — 答對 +20、速度獎勵 +5、配方錯誤 -20、未放材料 -30、超時 -15
- **倒數計時** — 每題限時，時間條視覺化，超時自動提交
- **自動提示** — N 秒後「魔藥筆記」自動浮現（每關可獨立設定秒數）
- **關卡重試** — 未達通關門檻可重做當前關卡，保留之前分數
- **21 欄位數據** — 含 scoreChange、totalScore、bonusEarned、attemptType、isTimeout 等分析維度
- **教師儀表板** — GAS 自動彙整 `學生總分` 工作表：各題型正確率、平均耗時、提示使用率

### 關卡結構

| 關卡 | 難度 | 類型 | 題數 | 限時 | 通關門檻 | 密碼 | 年級 |
|------|------|------|------|------|---------|------|------|
| 第 1 關 | 簡單 | 分數與小數互換 | 4 題 | 45s/題 | 60 分 | `potion101` | 四年級 |
| 第 2 關 | 中等 | 百分率與分數換算 | 4 題 | 50s/題 | 80 分 | `elixir202` | 五年級 |
| 第 3 關 | 困難 | 進階分數百分率 | 4 題 | 70s/題 | 100 分 | `grandmaster` | 五～六年級 |

### 分數規則

| 情境 | 分數 |
|------|------|
| 配方完全正確 | +20 |
| 在獎勵秒數內完成 | +5 |
| 配方錯誤（放了錯的材料） | -20 |
| 未放任何材料就提交 | -30 |
| 時間耗盡未提交 | -15 |

| 魔力值 | 稱號 |
|--------|------|
| 1500+ | 魔藥大師 |
| 1101+ | 首席魔藥師 |
| 801+ | 傑出煉金師 |
| 601+ | 魔藥專精生 |
| 401+ | 見習學生 |
| 201+ | 魔藥新手 |
| 0+ | 麻瓜 |

---

## ⚡ 部署步驟

### 1. 建立 Google 試算表

打開 [sheets.new](https://sheets.new)，GAS 會自動建立 `答題紀錄` 和 `學生總分` 兩個工作表，無需手動建立欄位。

### 2. 部署 Apps Script

1. 試算表 → 擴充功能 → Apps Script
2. 貼上 `concentration-lab.html` 結尾註解 `<!-- ... -->` 內的 **完整 GAS 程式碼**
3. 部署 → 新增部署 → 網頁應用程式（執行身分：我，存取：任何人）
4. **複製部署網址**

### 3. 設定遊戲

編輯 `concentration-lab.html`，搜尋 `WEB_APP_URL`，換成你的部署網址：

```javascript
const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### 4. 開始使用

學生打開遊戲 → 輸入班級座號（如 `1C32`）→ 開始調配魔藥，數據自動記錄。

---

## 📊 教師數據分析

### Sheet 1：`答題紀錄`（21 欄）

| 欄位 | 分析用途 |
|------|---------|
| `levelType` | 樞紐分析：各題型正確率 / 平均耗時 |
| `scoreChange` | 追蹤每題加扣分 |
| `totalScore` | 分數成長曲線 |
| `timeTaken` / `timeLimit` | 時間壓力分析 |
| `bonusEarned` | 快速學生識別 |
| `hintUsed` | 提示依賴度 |
| `attemptType` | 重試追蹤（first / retry） |
| `isTimeout` | 時間管理問題 |
| `materialsPlaced` | 答題行為分析 |

### Sheet 2：`學生總分`（自動彙整）

每次新數據寫入後自動更新：

| studentId | 最新總分 | 稱號 | 總題數 | 答對數 | 正確率 | 平均耗時 | 提示使用率 | 重試次數 | 超時次數 | 速度獎勵次數 |

---

## 📁 檔案

| 檔案 | 用途 |
|------|------|
| `game/concentration-lab.html` | **魔藥煉成所**（21 欄 + 雙路備份），內含 GAS 程式碼 |
| `game/magic-school.html` | 舊版濃度大挑戰 |
| `backend/Code.gs` | 舊版 GAS 後端（9 欄位） |
| `SETUP_GUIDE.md` | 圖文步驟教學 |

---

## 🎮 自訂關卡

編輯 `concentration-lab.html` 頂部的 `GAME_SETTING`：

```javascript
const GAME_SETTING = {
  scoreLabels: { 1500:"魔藥大師", 1101:"首席魔藥師", ... },
  levels: [
    {
      levelNo: 1,
      timeLimitSec: 50,      // 每題限時
      bonusTimeSec: 10,      // 幾秒內 +bonusScore
      bonusScore: 5,         // 速度獎勵分
      baseScore: 20,         // 答對基礎分
      wrongPenalty: -20,     // 配方錯誤
      emptyPenalty: -30,     // 未放材料
      timeoutPenalty: -15,   // 超時
      hintAutoSec: 15,       // 自動提示秒數 (0=不出現)
      passScore: 60,         // 通關門檻
      nextLevelPassword: "xxx",
      questions: [{
        target: "0.5",
        targetDisplay: "0.5",
        slots: 2,            // 需選幾個材料
        materials: [         // 材料架內容
          { label:"50%", emoji:"🧪" },
          { label:"1/2", emoji:"⚗️" },
          ...
        ],
        correctAnswers: ["50%","1/2"],
        hint: "0.5 = 1/2 = 50%"
      }]
    }
  ]
};
```

系統自動計算總題數、動態渲染、自動計分。**零程式碼修改。**
