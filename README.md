# HR AI Agent 도입 기획안 및 타당성 사전 평가 — 설문

링크 배포용 설문이며, 응답은 **설문 ID별**로 Google Sheet에 저장됩니다.

---

## 1. 구성 파일

| 경로 | 설명 |
|------|------|
| `survey/index.html` | 설문 페이지 (Part 1 기획안 + Part 2 자가 진단표) |
| `survey/styles.css` | Qualtrics/GitHub 스타일 디자인 |
| `survey/script.js` | 설문 ID 생성, 동적 필드(+ 버튼), 점수 계산, 제출 |
| `google-apps-script/Code.gs` | Google Sheet에 응답 저장하는 웹 앱 스크립트 |
| `SHEET_COLUMNS.md` | Google Sheet 열 이름(질문 번호/약어) 매핑 |

---

## 2. Google Sheet 연동 설정

### 2-1. 스프레드시트 준비

1. [Google 스프레드시트](https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
2. URL에서 **스프레드시트 ID**를 복사합니다.  
   예: `https://docs.google.com/spreadsheets/d/`**`1abc...xyz`**`/edit` → `1abc...xyz`
3. 시트는 비어 있어도 됩니다. (스크립트가 첫 제출 시 헤더를 자동으로 넣습니다.)  
   열 이름 정의는 `SHEET_COLUMNS.md`를 참고하면 됩니다.

### 2-2. Apps Script 배포

1. 해당 스프레드시트에서 **확장 프로그램** → **Apps Script** 를 엽니다.
2. `google-apps-script/Code.gs` 내용을 복사해 기본 `Code.gs`에 붙여넣습니다.
3. `Code.gs` 안에서 **`YOUR_SPREADSHEET_ID`** 를 위에서 복사한 스프레드시트 ID로 바꿉니다.
4. **배포** → **새 배포** → 유형에서 **웹 앱** 선택 후:
   - 설명: 예) "HR 설문 제출"
   - "다음 사용자로 실행": **나**
   - "액세스 권한": **모든 사용자** (링크를 아는 누구나 제출 가능하도록 할 경우)  
     ※ **Google Workspace**를 쓰는 경우, 내부용만 쓸 거라면 **"내 조직의 사용자"**로 두면 아래 검증 경고가 나오지 않습니다.
5. **배포**를 누르고 생성된 **웹 앱 URL**을 복사합니다.

#### "Google hasn't verified this app" 경고가 나올 때

웹 앱 URL을 처음 열거나 제출 후 결과 페이지가 열릴 때, **"Google hasn't verified this app"** / **"이 앱은 Google에서 검증하지 않았습니다"** 메시지가 나올 수 있습니다.

- **이 스크립트는 본인이 만든 앱**이며, **본인 계정의 스프레드시트**에만 쓸 뿐, 응답자의 Google 계정에 접근하지 않습니다. (실행 주체는 **나**로 두었기 때문에, 항상 **배포한 본인 계정**으로만 동작합니다.)
- **사내/개인 용도**로 쓰는 경우:
  1. 경고 화면에서 **고급** (또는 **Advanced**) 를 클릭합니다.
  2. **"[앱 이름](으)로 이동(안전하지 않음)"** (또는 **Go to [app name] (unsafe)**) 를 클릭합니다.
  3. 그러면 앱이 열리고, 설문 제출·시트 저장은 정상적으로 동작합니다.
- **Google 공식 검증**은 수백 명 이상의 일반 사용자에게 공개할 때 필요합니다. 내부 설문용이라면 위처럼 "고급 → 이동"으로 진행해 사용해도 됩니다.
- **Google Workspace**를 사용 중이라면, 배포 시 액세스 권한을 **"내 조직의 사용자"**로 설정하면 조직 사용자는 이 경고 없이 이용할 수 있습니다.

### 2-3. 설문 쪽에 URL 넣기

1. `survey/script.js`를 엽니다.
2. 상단의 **`SUBMIT_URL`** 값을 복사한 웹 앱 URL로 바꿉니다.  
   예: `var SUBMIT_URL = 'https://script.google.com/macros/s/AKfy.../exec';`

---

## 3. GitHub 푸시 및 설문 배포 (GitHub Pages)

아래는 저장소 **https://github.com/ibnsiner/hr_agent_planning** 에 푸시한 뒤, GitHub Pages로 설문을 배포하는 절차입니다.  
(2-3까지 완료했다면 `SUBMIT_URL`은 이미 설정된 상태입니다.)

### 3-1. 준비

- [Git 설치](https://git-scm.com/downloads)가 되어 있어야 합니다.
- GitHub 계정으로 로그인된 상태에서 위 저장소를 사용합니다.

### 3-2. 로컬에서 Git 초기화 및 푸시

프로젝트 폴더(`Agent_planning`)에서 **터미널(또는 PowerShell)** 을 열고 아래를 순서대로 실행합니다.

```bash
# 1) Git 저장소 초기화 (이미 되어 있으면 생략)
git init

# 2) 기본 브랜치 이름을 main으로 (선택)
git branch -M main

# 3) 원격 저장소 연결 (본인 GitHub 사용자명/저장소명에 맞게)
git remote add origin https://github.com/ibnsiner/hr_agent_planning.git

# 이미 origin이 있다면 주소만 바꾸려면:
# git remote set-url origin https://github.com/ibnsiner/hr_agent_planning.git

# 4) 모든 파일 스테이징
git add .

# 5) 첫 커밋
git commit -m "Add HR AI Agent survey and Google Sheet integration"

# 6) GitHub에 푸시 (저장소가 비어 있으면 이 한 번으로 올라감)
git push -u origin main
```

- **이미 `origin`이 있고 다른 URL이 연결돼 있다면** 3번 대신 `git remote set-url origin https://github.com/ibnsiner/hr_agent_planning.git` 로 주소만 수정하면 됩니다.
- 푸시 시 **GitHub 로그인** 창이 뜨면 로그인하거나, Personal Access Token을 비밀번호 자리에 넣어 인증합니다.

### 3-3. GitHub Pages 설정 (설문 링크 활성화)

1. 브라우저에서 **https://github.com/ibnsiner/hr_agent_planning** 로 이동합니다.
2. 상단 메뉴에서 **Settings** 를 클릭합니다.
3. 왼쪽에서 **Pages** 를 클릭합니다.
4. **Build and deployment** 섹션에서:
   - **Source**: **Deploy from a branch** 를 선택합니다.
   - **Branch**: `main` (또는 사용 중인 기본 브랜치)을 선택하고, 폴더는 **/ (root)** 를 선택합니다.
   - **Save** 를 누릅니다.
5. 몇 분 후(보통 1~2분) 아래 주소로 접속 가능해집니다.

| 용도 | URL |
|------|-----|
| **설문 페이지 (배포 링크)** | **https://ibnsiner.github.io/hr_agent_planning/survey/** |
| 루트 (설문으로 리다이렉트) | https://ibnsiner.github.io/hr_agent_planning/ |

### 3-4. 배포 확인 및 링크 공유

- **https://ibnsiner.github.io/hr_agent_planning/survey/** 를 브라우저에서 열어 설문이 뜨는지 확인합니다.
- 이 주소를 응답자에게 링크로 공유하면 됩니다. 제출 데이터는 2-2에서 설정한 Google 스프레드시트에 설문 ID별로 쌓입니다.

### 3-5. 이후 수정 시 (재배포)

코드를 수정한 뒤 같은 브랜치에 푸시하면 GitHub Pages가 자동으로 다시 배포됩니다.

```bash
git add .
git commit -m "설문 문구 수정"
git push origin main
```

---

## 기타 호스팅 (참고)

- **Netlify / Vercel**: 프로젝트 루트 또는 `survey` 폴더를 연결해 배포할 수 있습니다.
- **사내 웹 서버**: `survey` 폴더 전체를 문서 루트에 올린 뒤 해당 URL을 공유하면 됩니다.

---

## 4. 동작 요약

- **설문 ID**: 페이지 로드 시 `HR-YYYYMMDDHHMMSS-xxxxxx` 형식으로 자동 생성되며, 화면 상단에 표시됩니다. 같은 브라우저 세션에서는 동일 ID가 유지됩니다.
- **Part 2 점수**: 체크한 항목 개수가 자동으로 A/B/C 및 종합 점수로 반영됩니다.
- **+ 버튼**: "참조 시스템/데이터 추가", "참조 규정/문서", "Step 추가"에서 텍스트 입력란을 추가할 수 있습니다.
- **제출**: 버튼 클릭 시 폼 데이터가 Google Apps Script 웹 앱으로 POST되고, 새 탭에서 결과 메시지가 열리며, 현재 탭에는 토스트로 "제출되었습니다. 설문 ID: …"가 표시됩니다.
- **시트**: 각 응답은 한 행으로 저장되며, 열 이름은 `SHEET_COLUMNS.md`와 동일합니다. 긴 질문은 번호/약어로 저장됩니다.

---

## 5. 참고

- Google Apps Script 웹 앱 URL은 **배포할 때마다** 바뀔 수 있습니다. "버전 관리"로 새 버전을 배포하면 기존 URL이 유지되는 경우가 많습니다.
- 시트가 비어 있을 때만 헤더를 쓰므로, 이미 1행에 다른 내용이 있으면 `Code.gs`의 `HEADERS()` 순서에 맞게 1행을 직접 넣어야 합니다. 자세한 열 목록은 `SHEET_COLUMNS.md`를 참고하세요.
- **"Google hasn't verified this app"** 경고가 뜨는 경우: 위 **2-2 "Google hasn't verified this app" 경고가 나올 때** 절을 참고해, 고급 → (앱 이름)(으)로 이동을 선택하면 됩니다.
