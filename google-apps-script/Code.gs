/**
 * HR AI Agent 설문 — Google Sheets 연동
 * 1. 새 Google 스프레드시트를 만들고, 첫 시트의 1행에 아래 HEADERS 순서대로 열 이름을 입력하세요.
 * 2. 확장 프로그램 > Apps Script에서 이 코드를 붙여넣고 저장한 뒤,
 *    "배포" > "새 배포" > "웹 앱"으로 배포하고 URL을 복사해 설문 쪽 SUBMIT_URL에 넣으세요.
 */

function doPost(e) {
  try {
    var params = e.parameter; // 폼 POST로 전달된 모든 필드
    var sheet = getSheet();
    if (!sheet) {
      return response('시트를 찾을 수 없습니다. 스프레드시트 ID와 시트 이름을 확인하세요.', 500);
    }

    // 시트가 비어 있으면 첫 행에 헤더 작성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS());
    }

    var row = buildRow(params);
    sheet.appendRow(row);
    return response('제출되었습니다. 설문 ID: ' + (params.survey_id || ''), 200);
  } catch (err) {
    return response('오류: ' + err.toString(), 500);
  }
}

function getSheet() {
  var spreadsheetId = 'YOUR_SPREADSHEET_ID'; // 스프레드시트 URL의 /d/ 와 /edit 사이 문자열
  var sheetName = 'Sheet1';                    // 시트 이름 (필요 시 변경)
  var ss = SpreadsheetApp.openById(spreadsheetId);
  return ss.getSheetByName(sheetName) || ss.getSheets()[0];
}

// SHEET_COLUMNS.md 순서와 동일하게 한 행 배열로 만듦
function buildRow(params) {
  var h = HEADERS();
  return h.map(function (key) {
    var v = params[key];
    return v != null ? String(v) : '';
  });
}

function HEADERS() {
  return [
    'survey_id', 'timestamp',
    'P1_title', 'P1_dept', 'P1_contact', 'P1_user',
    'P1_trigger_manual', 'P1_trigger_schedule', 'P1_trigger_event', 'P1_trigger_etc',
    'P1_input_user', 'P1_ref_sys1', 'P1_ref_sys2', 'P1_ref_sys_more', 'P1_ref_doc',
    'P1_logic', 'P1_step1', 'P1_step2', 'P1_step3', 'P1_step_more',
    'P1_output', 'P1_next_L1', 'P1_next_L2', 'P1_next_L3', 'P1_next_L4',
    'V1_1', 'V1_2', 'V1_3', 'V1_4', 'V1_5', 'V2_1', 'V2_2', 'V2_3', 'V2_4', 'V2_5', 'V3_1', 'V3_2', 'V3_3', 'V3_4', 'V3_5',
    'F1_1', 'F1_2', 'F1_3', 'F1_4', 'F1_5', 'F2_1', 'F2_2', 'F2_3', 'F2_4', 'F2_5', 'F3_1', 'F3_2', 'F3_3', 'F3_4', 'F3_5', 'F4_1', 'F4_2', 'F4_3', 'F4_4', 'F4_5',
    'Rk1_1', 'Rk1_2', 'Rk1_3', 'Rk1_4', 'Rk1_5', 'Rk2_1', 'Rk2_2', 'Rk2_3', 'Rk2_4', 'Rk2_5', 'Rk3_1', 'Rk3_2', 'Rk3_3', 'Rk3_4', 'Rk3_5',
    'score_value', 'score_feasibility', 'score_risk', 'score_total',
    'LoA_target', 'LoA_risk_pass', 'result', 'memo'
  ];
}

function response(text, code) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>제출 결과</title></head><body><p>' +
    text.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
    '</p><p><a href="javascript:window.close()">창 닫기</a></p></body></html>';
  return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
}
