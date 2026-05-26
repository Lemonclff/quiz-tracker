/**
 * 魔法學園 — Google Apps Script 後端
 * ====================================
 * 部署為網頁應用程式，接收學生答題紀錄並寫入 Google 試算表。
 *
 * 部署步驟：
 *   1. 在試算表選單 → 擴充功能 → Apps Script
 *   2. 貼上此檔案全部內容
 *   3. 部署 → 新增部署 → 網頁應用程式
 *      - 執行身分：我
 *      - 誰可以存取：任何人
 *   4. 複製部署網址，貼到遊戲 HTML 的 SCRIPT_URL
 *
 * Sheets 結構（第一列為標題）：
 *   學生座號 | 時間 | 關卡 | 題型 | 目標濃度 | 正確與否 | 所選答案 | 答題時間(秒) | 是否使用提示
 */

// ═══════════════════════════════════════════════════════════
// 部署後對外開放的唯一入口
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("學習紀錄");
    const data = JSON.parse(e.postData.contents);

    // 寫入一行資料
    sheet.appendRow([
      data.studentId,          // 學生座號
      data.timestamp,          // 時間
      data.level,              // 關卡
      data.type,               // 題型
      data.target,             // 目標濃度
      data.correct,            // 正確與否
      data.chosen,             // 所選答案
      data.time,               // 答題時間（秒）
      data.hintUsed            // 是否使用提示
    ]);

    // 自動排序：依時間由新到舊
    autoSort(sheet);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ═══════════════════════════════════════════════════════════
// 輔助：自動排序（最新資料在最上面）
// ═══════════════════════════════════════════════════════════

function autoSort(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 2) return; // 只有標題列 + 1 筆資料，無需排序
  const range = sheet.getRange(2, 1, lastRow - 1, 9);
  range.sort({ column: 2, ascending: false }); // 依時間欄（第 2 欄）降序
}

// ═══════════════════════════════════════════════════════════
// 可選：手動觸發，清除所有測試資料
// ═══════════════════════════════════════════════════════════

function clearAllData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("學習紀錄");
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  }
}

// ═══════════════════════════════════════════════════════════
// 可選：手動觸發，在標題列下方插入範例資料（測試用）
// ═══════════════════════════════════════════════════════════

function insertSampleData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("學習紀錄");
  sheet.appendRow(["01", "2026/6/15 上午 10:30:00", "1", "百分數", "30%", "✅", "30/100", "12.5", "否"]);
  sheet.appendRow(["02", "2026/6/15 上午 10:30:15", "1", "分數", "3/4", "❌", "2/4", "18.2", "是"]);
  sheet.appendRow(["01", "2026/6/15 上午 10:30:45", "2", "小數", "0.25", "✅", "25/100", "8.3", "否"]);
}
