# 🖼️ 圖文設定教學

> 以下對應 README 的 4 個步驟，附上畫面說明。

---

## 步驟 1：建立試算表

1. 瀏覽器打開 **sheets.new**
2. 看到空白試算表
3. 雙擊左下角工作表名稱 → 改名為 `學習紀錄`
4. 在第一列（A1 到 I1）依序填入：

```
A1: 學生座號
B1: 時間
C1: 關卡
D1: 題型
E1: 目標濃度
F1: 正確與否
G1: 所選答案
H1: 答題時間(秒)
I1: 是否使用提示
```

完成後畫面：

```
┌────────┬────────┬──────┬──────┬────────┬────────┬────────┬──────────┬────────┐
│學生座號 │ 時間   │ 關卡 │ 題型 │ 目標濃度│正確與否│所選答案 │答題時間(s)│是否提示│
├────────┼────────┼──────┼──────┼────────┼────────┼────────┼──────────┼────────┤
│        │        │      │      │        │        │        │          │        │
```

---

## 步驟 2：部署 Apps Script

### 2a. 打開編輯器
試算表上方選單 → **擴充功能** → **Apps Script**

### 2b. 貼上程式碼
1. 刪除編輯器內所有預設文字
2. 打開本專案的 `backend/Code.gs`
3. 全選 (Ctrl+A) → 複製 (Ctrl+C)
4. 在 Apps Script 編輯器貼上 (Ctrl+V)
5. 點上方 💾 儲存圖示

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

---

## 步驟 3：設定遊戲 HTML

1. 打開 `game/magic-school.html`
2. 搜尋 `SCRIPT_URL`（Ctrl+F）
3. 找到這行：
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
   ```
4. 把 `YOUR_SCRIPT_ID` 整段換成步驟 2 複製的網址
5. 存檔

---

## 步驟 4：發佈遊戲

### 選項 A：GitHub Pages（推薦，免費永久）

```bash
# 在專案目錄
git init
git add .
git commit -m "魔法學園"
git remote add origin https://github.com/YOUR_USERNAME/quiz-tracker.git
git push -u origin main
```

然後在 GitHub 倉庫 → Settings → Pages → Source: main branch → Save。
幾分鐘後會得到 `https://YOUR_USERNAME.github.io/quiz-tracker/game/magic-school.html`

### 選項 B：Netlify Drop（最簡單）

1. 打開 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把 `game/` 資料夾直接拖進去
3. 自動部署，獲得網址

### 選項 C：本地測試

直接雙擊 `magic-school.html` 用瀏覽器打開。

---

## ✅ 驗證

1. 打開遊戲網頁，輸入座號 `01`
2. 答幾題
3. 回到 Google 試算表 → 重新整理 (F5)
4. 應該看到資料一行一行出現！

---

## 🔄 修改遊戲後如何更新？

- **GitHub Pages**：`git add . && git commit -m "update" && git push`
- **Netlify**：重新拖曳覆蓋
- **本地**：直接存檔即可
