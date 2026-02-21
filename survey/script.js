(function () {
  'use strict';

  // Google Apps Script Web App URL — 배포 후 여기에 실제 URL을 넣으세요.
  var SUBMIT_URL = 'https://script.google.com/macros/s/AKfycby4LZ5O539dYEMRCM3IiXYqp3GZEyUcyqSNa53Xp_zUbPIPohwF_TAxN6Vr8tqCdR8/exec';

  var form = document.getElementById('hr-survey');
  var surveyIdEl = document.getElementById('survey-id');
  var toastEl = document.getElementById('toast');

  function generateSurveyId() {
    var now = new Date();
    var dateStr = now.getFullYear() + '' +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    var rnd = Math.random().toString(36).slice(2, 8);
    return 'HR-' + dateStr + '-' + rnd;
  }

  function getOrCreateSurveyId() {
    try {
      var stored = sessionStorage.getItem('hr_survey_id');
      if (stored) return stored;
    } catch (e) {}
    var id = generateSurveyId();
    try {
      sessionStorage.setItem('hr_survey_id', id);
    } catch (e) {}
    return id;
  }

  function showToast(message, type) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'toast show ' + (type || '');
    setTimeout(function () {
      toastEl.classList.remove('show');
    }, 4000);
  }

  // ——— 동적 항목 추가 (+) ———  // + 클릭 시 1행만 추가 (이벤트 위임만 사용)
  function initDynamicLists() {
    document.querySelectorAll('.dynamic-list').forEach(function (block) {
      var container = block.querySelector('.dynamic-items');
      var template = block.querySelector('.dynamic-item');
      if (!container || !template) return;

      container.addEventListener('click', function (e) {
        if (!e.target.classList.contains('btn-add')) return;
        e.preventDefault();
        e.stopPropagation();
        var newRow = template.cloneNode(true);
        var inp = newRow.querySelector('input');
        if (inp) {
          inp.value = '';
          inp.name = template.querySelector('input').name;
        }
        container.appendChild(newRow);
      });
    });
  }

  // ——— Part 2 점수 계산 ———
  var valueNames = ['V1_1','V1_2','V1_3','V1_4','V1_5','V2_1','V2_2','V2_3','V2_4','V2_5','V3_1','V3_2','V3_3','V3_4','V3_5'];
  var feasibilityNames = ['F1_1','F1_2','F1_3','F1_4','F1_5','F2_1','F2_2','F2_3','F2_4','F2_5','F3_1','F3_2','F3_3','F3_4','F3_5','F4_1','F4_2','F4_3','F4_4','F4_5'];
  var riskNames = ['Rk1_1','Rk1_2','Rk1_3','Rk1_4','Rk1_5','Rk2_1','Rk2_2','Rk2_3','Rk2_4','Rk2_5','Rk3_1','Rk3_2','Rk3_3','Rk3_4','Rk3_5'];

  function countChecked(names) {
    return names.reduce(function (sum, name) {
      var el = form.querySelector('[name="' + name + '"]');
      return sum + (el && el.checked ? 1 : 0);
    }, 0);
  }

  function updateScores() {
    var v = countChecked(valueNames);
    var f = countChecked(feasibilityNames);
    var r = countChecked(riskNames);
    var elVal = document.getElementById('score-value');
    var elFeas = document.getElementById('score-feasibility');
    var elRisk = document.getElementById('score-risk');
    var elTotal = document.getElementById('score-total');
    if (elVal) elVal.textContent = v;
    if (elFeas) elFeas.textContent = f;
    if (elRisk) elRisk.textContent = r;
    if (elTotal) elTotal.textContent = v + f + r;
  }

  form.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', updateScores);
  });

  // ——— 폼 데이터 수집 (Google Sheet 열 순서에 맞춤) ———
  function getDynamicValues(namePattern) {
    var inputs = form.querySelectorAll('input[name="' + namePattern + '"]');
    var vals = [];
    inputs.forEach(function (input) {
      if (input.value && input.value.trim()) vals.push(input.value.trim());
    });
    return vals.join('\n');
  }

  function collectFormData() {
    var sid = getOrCreateSurveyId();
    var data = {
      survey_id: sid,
      timestamp: new Date().toISOString(),
      P1_title: (form.P1_title && form.P1_title.value) ? form.P1_title.value.trim() : '',
      P1_dept: (form.P1_dept && form.P1_dept.value) ? form.P1_dept.value.trim() : '',
      P1_contact: (form.P1_contact && form.P1_contact.value) ? form.P1_contact.value.trim() : '',
      P1_user: (form.P1_user && form.P1_user.value) ? form.P1_user.value.trim() : '',
      P1_trigger_manual: form.P1_trigger_manual && form.P1_trigger_manual.checked ? '1' : '0',
      P1_trigger_schedule: form.P1_trigger_schedule && form.P1_trigger_schedule.checked ? '1' : '0',
      P1_trigger_event: form.P1_trigger_event && form.P1_trigger_event.checked ? '1' : '0',
      P1_trigger_etc: (form.P1_trigger_etc && form.P1_trigger_etc.value) ? form.P1_trigger_etc.value.trim() : '',
      P1_input_user: (form.P1_input_user && form.P1_input_user.value) ? form.P1_input_user.value.trim() : '',
      P1_ref_sys1: (form.P1_ref_sys1 && form.P1_ref_sys1.value) ? form.P1_ref_sys1.value.trim() : '',
      P1_ref_sys2: (form.P1_ref_sys2 && form.P1_ref_sys2.value) ? form.P1_ref_sys2.value.trim() : '',
      P1_ref_sys_more: getDynamicValues('P1_ref_sys_more[]'),
      P1_ref_doc: getDynamicValues('P1_ref_doc[]'),
      P1_logic: (form.P1_logic && form.P1_logic.value) ? form.P1_logic.value.trim() : '',
      P1_step1: (form.P1_step1 && form.P1_step1.value) ? form.P1_step1.value.trim() : '',
      P1_step2: (form.P1_step2 && form.P1_step2.value) ? form.P1_step2.value.trim() : '',
      P1_step3: (form.P1_step3 && form.P1_step3.value) ? form.P1_step3.value.trim() : '',
      P1_step_more: getDynamicValues('P1_step_more[]'),
      P1_output: (form.P1_output && form.P1_output.value) ? form.P1_output.value.trim() : '',
      P1_next_L1: form.P1_next_L1 && form.P1_next_L1.checked ? '1' : '0',
      P1_next_L2: form.P1_next_L2 && form.P1_next_L2.checked ? '1' : '0',
      P1_next_L3: form.P1_next_L3 && form.P1_next_L3.checked ? '1' : '0',
      P1_next_L4: form.P1_next_L4 && form.P1_next_L4.checked ? '1' : '0'
    };

    valueNames.forEach(function (n) {
      data[n] = form[n] && form[n].checked ? '1' : '0';
    });
    feasibilityNames.forEach(function (n) {
      data[n] = form[n] && form[n].checked ? '1' : '0';
    });
    riskNames.forEach(function (n) {
      data[n] = form[n] && form[n].checked ? '1' : '0';
    });

    data.score_value = String(countChecked(valueNames));
    data.score_feasibility = String(countChecked(feasibilityNames));
    data.score_risk = String(countChecked(riskNames));
    data.score_total = String(countChecked(valueNames) + countChecked(feasibilityNames) + countChecked(riskNames));

    var loa = form.querySelector('input[name="LoA_target"]:checked');
    data.LoA_target = loa ? loa.value : '';
    var riskPass = form.querySelector('input[name="LoA_risk_pass"]:checked');
    data.LoA_risk_pass = riskPass ? riskPass.value : '';
    var result = form.querySelector('input[name="result"]:checked');
    data.result = result ? result.value : '';
    data.memo = (form.memo && form.memo.value) ? form.memo.value.trim() : '';

    return data;
  }

  function submitForm() {
    var data = collectFormData();
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '제출 중…';
    }

    if (!SUBMIT_URL || SUBMIT_URL.indexOf('YOUR_GOOGLE') === 0) {
      showToast('Google Sheets 연동 URL이 설정되지 않았습니다. script.js의 SUBMIT_URL을 설정한 뒤 다시 시도해 주세요.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '제출하기';
      }
      console.warn('설문 데이터(미전송):', data);
      return;
    }

    // CORS 회피: 폼 POST로 제출 (새 탭에서 열림)
    var f = document.createElement('form');
    f.method = 'POST';
    f.action = SUBMIT_URL;
    f.target = '_blank';
    f.style.display = 'none';
    Object.keys(data).forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key] == null ? '' : String(data[key]);
      f.appendChild(input);
    });
    document.body.appendChild(f);
    f.submit();
    document.body.removeChild(f);

    showToast('제출되었습니다. 설문 ID: ' + data.survey_id + ' (새 탭에서 확인)', 'success');
    if (submitBtn) {
      submitBtn.textContent = '제출 완료';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitForm();
  });

  // 초기화
  if (surveyIdEl) surveyIdEl.textContent = getOrCreateSurveyId();
  initDynamicLists();
  updateScores();
})();
