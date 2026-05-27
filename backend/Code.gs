// ═══════════════════════════════════════════════════════════════════
// 魔法學園 · 魔藥煉成所 — Google Apps Script 後端 v2
// 22 欄位 + requestId 去重 + 學生總分自動彙整
// ═══════════════════════════════════════════════════════════════════
//
// 部署步驟：
//   1. 開啟 Google 試算表 → 擴充功能 → Apps Script
//   2. 貼上此檔案全部內容，取代預設文字
//   3. 部署 → 新增部署 → 網頁應用程式（執行身分：我，存取：任何人）
//   4. 複製部署網址，貼到 concentration-lab.html 的 WEB_APP_URL
//
// Sheets 試算表結構（第一列為標題，共 22 欄）
//   A: timestamp        B: studentId       C: gameTitle       D: levelNo
//   E: questionNo       F: difficulty      G: levelType       H: target
//   I: chosenMaterials  J: correctAnswers  K: isCorrect       L: scoreChange
//   M: totalScore       N: timeTaken       O: timeLimit       P: bonusEarned
//   Q: hintUsed         R: attemptType     S: materialsPlaced T: isTimeout
//   U: rank             V: requestId       （去重識別碼）
//

// ---- 設定區 ----
var CONFIG = {
  sheetName: '答題紀錄',
  summarySheetName: '學生總分',
  jsonFileName: 'all_students_logs.json',
  folderName: '魔法學園_數據備份'
};

// ═══════════════════════════════════════════════════════════════════
// doPost(e) — 接收前端 POST，雙路同步
// ═══════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // 🔑 重複檢查：相同 requestId 不再寫入
    if (payload.requestId && isDuplicateRequest(payload.requestId)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', deduplicated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    appendToSheet(payload);
    appendToDriveJson(payload);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: '魔藥煉成所 API', timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════════
// 路徑 A：即時寫入 Google 試算表 (22 欄，requestId 在最後)
// ═══════════════════════════════════════════════════════════════════
function appendToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  var headers = ['timestamp','studentId','gameTitle','levelNo','questionNo',
      'difficulty','levelType','target','chosenMaterials','correctAnswers',
      'isCorrect','scoreChange','totalScore','timeTaken','timeLimit',
      'bonusEarned','hintUsed','attemptType','materialsPlaced','isTimeout','rank',
      'requestId'];
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.sheetName);
    sheet.appendRow(headers);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  sheet.appendRow([
    data.timestamp        || '',
    data.studentId        || '',
    data.gameTitle        || '',
    data.levelNo          || '',
    data.questionNo       || '',
    data.difficulty       || '',
    data.levelType        || '',
    data.target           || '',
    data.chosenMaterials  || '',
    data.correctAnswers   || '',
    data.isCorrect        || false,
    data.scoreChange      || 0,
    data.totalScore       || 0,
    data.timeTaken        || 0,
    data.timeLimit        || 0,
    data.bonusEarned      || false,
    data.hintUsed         || false,
    data.attemptType      || '',
    data.materialsPlaced  || 0,
    data.isTimeout        || false,
    data.rank             || '',
    data.requestId        || ''
  ]);

  autoSortSheet(sheet);
  refreshStudentSummary();
}

// ═══════════════════════════════════════════════════════════════════
// 路徑 B：累積寫入 Drive JSON
// ═══════════════════════════════════════════════════════════════════
function appendToDriveJson(data) {
  var folder = getOrCreateFolder(CONFIG.folderName);
  var file   = getOrCreateJsonFile(folder, CONFIG.jsonFileName);
  var existing = file.getBlob().getDataAsString();
  var records = [];
  if (existing && existing.trim() !== '') {
    try { records = JSON.parse(existing); if (!Array.isArray(records)) records = []; }
    catch (err) { records = []; }
  }
  records.push({
    timestamp: data.timestamp, studentId: data.studentId, gameTitle: data.gameTitle,
    levelNo: data.levelNo, questionNo: data.questionNo,
    difficulty: data.difficulty, levelType: data.levelType,
    target: data.target, chosenMaterials: data.chosenMaterials,
    correctAnswers: data.correctAnswers, isCorrect: data.isCorrect,
    scoreChange: data.scoreChange, totalScore: data.totalScore,
    timeTaken: data.timeTaken, timeLimit: data.timeLimit,
    bonusEarned: data.bonusEarned, hintUsed: data.hintUsed,
    attemptType: data.attemptType, materialsPlaced: data.materialsPlaced,
    isTimeout: data.isTimeout, rank: data.rank,
    _receivedAt: new Date().toISOString()
  });
  file.setContent(JSON.stringify(records, null, 2));
}

// ═══════════════════════════════════════════════════════════════════
// 自動彙整：學生總分工作表
// ═══════════════════════════════════════════════════════════════════
function refreshStudentSummary() {
  try {
    var dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
    if (!dataSheet || dataSheet.getLastRow() <= 1) return;

    var summarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.summarySheetName);
    if (!summarySheet) {
      summarySheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.summarySheetName);
      summarySheet.appendRow([
        'studentId','最新總分','稱號','總題數','答對數','正確率',
        '平均耗時(秒)','提示使用率','重試次數','超時次數','速度獎勵次數'
      ]);
    }
    // 清除舊彙整（保留標題列）
    if (summarySheet.getLastRow() > 1) summarySheet.getRange(2, 1, summarySheet.getLastRow()-1, 11).clearContent();

    var data = dataSheet.getDataRange().getValues();
    if (data.length <= 1) return;
    var headers = data[0];
    var idx = {};
    for (var i = 0; i < headers.length; i++) { idx[headers[i]] = i; }

    // 按 studentId 分組
    var groups = {};
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var sid = row[idx.studentId];
      if (!sid) continue;
      if (!groups[sid]) groups[sid] = [];
      groups[sid].push(row);
    }

    var keys = Object.keys(groups);
    keys.sort();
    for (var k = 0; k < keys.length; k++) {
      var sid = keys[k];
      var rows = groups[sid];
      rows.sort(function(a,b){ return (b[idx.timestamp]||'').toString().localeCompare((a[idx.timestamp]||'').toString()); });
      var latest = rows[0];
      var totalScore = latest[idx.totalScore] || 0;
      var rank = latest[idx.rank] || '';
      var totalQ = rows.length;
      var correctQ = 0;
      for (var r = 0; r < rows.length; r++) { if (rows[r][idx.isCorrect]) correctQ++; }
      var acc = totalQ > 0 ? Math.round(correctQ/totalQ*100) : 0;
      var sumTime = 0;
      for (var r2 = 0; r2 < rows.length; r2++) { sumTime += Number(rows[r2][idx.timeTaken]) || 0; }
      var avgTime = totalQ > 0 ? (sumTime/totalQ).toFixed(2) : 0;
      var hintCount = 0, retryCount = 0, timeoutCount = 0, bonusCount = 0;
      for (var r3 = 0; r3 < rows.length; r3++) {
        if (rows[r3][idx.hintUsed]) hintCount++;
        if (rows[r3][idx.attemptType] === 'retry') retryCount++;
        if (rows[r3][idx.isTimeout]) timeoutCount++;
        if (rows[r3][idx.bonusEarned]) bonusCount++;
      }
      var hintRate = totalQ > 0 ? Math.round(hintCount/totalQ*100) : 0;

      summarySheet.appendRow([sid,totalScore,rank,totalQ,correctQ,acc+'%',avgTime,hintRate+'%',retryCount,timeoutCount,bonusCount]);
    }
  } catch(err) {
    Logger.log('refreshStudentSummary 錯誤: ' + err.toString());
  }
}

// ═══════════════════════════════════════════════════════════════════
// 輔助函式
// ═══════════════════════════════════════════════════════════════════
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
function getOrCreateJsonFile(folder, name) {
  var files = folder.getFilesByName(name);
  return files.hasNext() ? files.next() : folder.createFile(name, '[]', 'application/json');
}
function autoSortSheet(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 2) return;
  sheet.getRange(2, 1, lastRow-1, 22).sort({ column: 1, ascending: false }); // 依 timestamp (A欄) 降序
}
function clearAllData() {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (s && s.getLastRow()>1) s.getRange(2,1,s.getLastRow()-1,22).clearContent();
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.summarySheetName);
  if (ss && ss.getLastRow()>1) ss.getRange(2,1,ss.getLastRow()-1,11).clearContent();
  var f = getOrCreateFolder(CONFIG.folderName);
  var jf = getOrCreateJsonFile(f, CONFIG.jsonFileName);
  jf.setContent('[]');
}

// ═══════════════════════════════════════════════════════════════════
// 🔑 重複請求檢查：查詢現有資料中是否已存在相同 requestId
// ═══════════════════════════════════════════════════════════════════
function isDuplicateRequest(requestId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return false;
  // 只檢查最近 200 列以維持效能，requestId 在 V 欄 (第 22 欄)
  var startRow = Math.max(2, sheet.getLastRow() - 199);
  var data = sheet.getRange(startRow, 22, sheet.getLastRow() - startRow + 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === requestId) return true;
  }
  return false;
}
