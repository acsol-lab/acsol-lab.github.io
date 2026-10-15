# ACSoL 홈페이지 v8 — 메뉴·슬라이드·Equipment·CMS 개선

첨부한 **v7 Full Website**를 바탕으로 만든 버전입니다. 기존 색상, 연구 주제, 교수님 경력, Publications 데이터와 Pages CMS 저장 방식은 보존했습니다. 서버 구축, 빌드 명령, 유료 서비스는 필요하지 않습니다.

## 1. 변경 사항

1. **글씨 크기 확대:** 상단 메뉴, 로고 옆 영문 정식 명칭·한국어 연구실명, 작은 라벨과 부가 설명의 글씨 크기를 전반적으로 키웠습니다.
2. **Home 사진 슬라이드:** `Pages CMS → Home / 메인 화면 설정 → heroSlides`에 사진을 여러 장 추가하면 자동 전환·무한 반복합니다. `slideIntervalSeconds`에 5를 넣으면 5초 간격입니다. 이전/다음, 페이지 표시, 일시정지 버튼이 있습니다. 사진이 한 장뿐이면 슬라이드 버튼은 숨깁니다. 운영체제의 동작 줄이기 설정이 켜져 있으면 자동재생이 초기 정지되며 재생 버튼으로 켤 수 있습니다. 기존 `heroImage`는 `heroSlides`가 비어 있을 때 사용합니다.
3. **상단 여백과 제목 크기 축소:** PC에서 메뉴 페이지 상단 배너의 높이를 낮췄습니다. 메인 콘텐츠가 이전보다 빨리 보이도록 했습니다.
4. **Home 내용 압축:** `01 / The laboratory` 소개를 메인 사진 옆으로 통합하고 `What we explore` 전체 구역을 제거했습니다. `Notes from the lab`이 메인 소개 바로 아래에 나옵니다.
5. **People 하위 페이지:** `People` 메뉴에 마우스를 올리면 가로로 **Professor / Students / Alumni**가 나타납니다. `professor.html`은 교수님 프로필·경력·수상, `students.html`은 박사·석사, `alumni.html`은 졸업생만 보여줍니다. `people.html`은 3개 페이지로 들어가는 간단한 안내입니다. 모바일에서는 People 오른쪽 펼치기 버튼을 누릅니다.
6. **Research 하위 페이지:** `Research`는 4개 연구 분야를 한눈에 보여주는 `research.html`과 각 분야 상세를 보여주는 `research-detail.html?topic=1`~`4`로 구성했습니다. 상단 Research 메뉴의 4개 항목 이름은 `data/research.json`의 제목에서 자동으로 갱신됩니다. 상세 글·이미지·캡션은 **기존 Research CMS 데이터**를 그대로 활용합니다.
7. **Equipment 추가:** 상단 Publications 다음에 Equipment를 추가했습니다. `equipment.html`과 CMS의 `Equipment / 연구실 장비` 메뉴에서 장비명, 모델명, 제조사, 사진, 장비 소개, 활용 분야를 등록할 수 있습니다.
8. **컴팩트한 푸터:** 교수님 이메일·전화번호, 학생 대표 이름·이메일·전화번호, 연구실 주소, 찾아오는 길 링크를 푸터에 넣었습니다. 학생 대표·별도 길 안내 정보는 새로운 CMS `Contact / 학생 대표 · 찾아오는 길`에서 편집합니다. 교수님 연락처·주소는 기존 `People / 교수님 프로필`에서 편집합니다. 학생 대표 연락처가 비어 있으면 없는 정보를 임의로 표시하지 않습니다.

## 2. 기존 v7에 적용 (가장 안전한 방식)

**`ACSoL_v7_to_v8_Update_Only.zip`을 이용하세요.**

1. GitHub 저장소 백업: `Code → Download ZIP`.
2. 업데이트 ZIP 압축 해제 후 HTML, `site.js`, `styles.css`, `.pages.yml`을 저장소 최상위에 업로드/교체합니다.
3. 새로 추가된 `professor.html`, `students.html`, `alumni.html`, `research-detail.html`, `equipment.html`도 업로드합니다.
4. **새 파일** `data/contact.json`, `data/equipment.json`을 `data/` 폴더 안에 추가합니다.
5. 기존 `data/home.json`, `data/professor.json`, `data/research.json`, `data/students.json`, `data/alumni.json`, `data/publications.json`, `data/news.json`, `data/gallery.json`, `data/professor-*.json` 등을 **절대 삭제하거나 전체본 파일로 덮어쓰지 마세요.** 기존 CMS에서 등록한 콘텐츠가 들어 있습니다.
6. `.pages.yml`은 이름이 점(`.`)으로 시작하므로 GitHub 웹 업로더에서 막히면 GitHub 저장소에서 기존 파일의 ✎ 편집을 눌러 업데이트본 내용으로 교체합니다.
7. GitHub `Settings → Pages`의 배포 상태를 확인한 다음 `Ctrl + F5`로 새로고침합니다.
8. [Pages CMS](https://app.pagescms.org/)에서 Home, Equipment, Contact의 새 항목이 보이는지 확인합니다.

**새 저장소에서 시작할 경우** `ACSoL_v8_Full_Website.zip` 파일을 사용합니다. `index.html` 등이 저장소 최상위에 있어야 합니다. 전체 설치본에는 v7에서 제공된 예시 JSON 데이터가 포함되므로, 실제 운영 저장소를 통째로 덮어쓰는 용도로 사용하지 마세요.

## 3. CMS에서 메인 사진 여러 장 설정

`Pages CMS → Home / 메인 화면 설정`에서:

- `heroSlides` → `Add item` → 사진 `image`, 캡션 `caption`, 접근성 설명 `alt`를 등록합니다.
- 반복하여 원하는 수만큼 사진을 추가하고 저장합니다.
- `slideIntervalSeconds`에 전환 간격을 초 단위로 입력합니다. 허용 범위 2~60초, 미입력 시 5초입니다.
- 여러 장을 등록했다면 등록한 순서대로 재생하다가 마지막 다음에 첫 번째로 돌아갑니다.
- CMS에서 사진을 업로드하면 GitHub 저장소의 `media/`에 저장됩니다.

기존 `heroImage` 필드는 하위 호환용입니다. **`heroSlides`에 하나라도 사진을 등록하면 `heroSlides`가 우선**합니다.

## 4. Research 상세 페이지 편집

`Pages CMS → Research / 연구 분야 · 펼침 상세 내용`의 항목 1~4가 상단 Research 하위 메뉴와 `research-detail.html?topic=1`~`4`에 연결됩니다.

- `title`, `description`, `image`: 연구 분야 개요 및 상세 페이지 상단
- `detailIntro`: 상세 페이지의 첫 설명
- `detailSections`: 블록 여러 개 (제목, 글, 이미지, 캡션)
- `keywords`: 핵심 연구 키워드

CMS 목록 순서를 바꾸면 Research 하위 메뉴에 표시되는 순서도 바뀝니다. 현재 메뉴는 요청대로 첫 4개 항목을 대상으로 합니다.

## 5. Equipment 추가 방법

`Pages CMS → Equipment / 연구실 장비 → 항목 추가`에서 **장비 이름**을 필수로 입력하고, 모델명, 제조사, 사진, 설명, 활용 분야를 필요에 따라 입력한 뒤 저장하면 됩니다. 빈 초기 데이터 `[]`에서는 "장비 목록을 준비 중입니다" 안내가 표시됩니다.

## 6. 학생 대표·찾아오는 길 편집

`Pages CMS → Contact / 학생 대표 · 찾아오는 길`에서 담당자 이름, 이메일, 전화번호, 길 안내 문구, 추가 지도 URL(HTTPS)을 등록합니다. 교수님 연락처와 연구실 주소는 기존 교수님 프로필 CMS를 수정하면 푸터에도 반영됩니다. 푸터의 '오시는 길과 지도'는 Contact 페이지로 이동합니다.

## 7. 설치 전 꼭 확인할 것

- `data/`와 `media/`는 기존 파일을 유지할 것.
- GitHub Pages 브랜치 설정이 `main` + `/(root)`인지 확인할 것.
- 사진 파일은 실제 `media/` 경로에 올라와 있어야 함. 이번 ZIP에 `/media/img7804.avif`, `/media/jinsub.avif` 원본 이미지는 포함되지 않았으며, 기존 CMS/GitHub 사진 파일을 유지하면 됩니다.
- `preview-data.js`는 **파일 더블클릭 로컬 미리보기용 스냅샷**입니다. CMS에 등록한 실시간 운영 내용은 GitHub Pages에서 `data/*.json`을 읽으므로, 로컬 미리보기와 내용이 다를 수 있습니다. 로컬 스냅샷을 새로 만들려면 `python tools/refresh_preview.py`를 실행하세요.

## 8. 검증 범위

`python tools/check_site.py`로 12개 HTML, CSS·JS·링크 참조, 페이지 ID, JSON 형식을 검사했고, `node --check site.js` 및 CSS 구문 검사를 통과했습니다. **이 환경에서는 Chromium이 로컬 파일 및 localhost 접근을 차단하여 PC/모바일 실제 브라우저 렌더링과 Pages CMS 로그인 테스트를 완료하지 못했습니다.** GitHub에 배포한 뒤 메뉴 및 사진 전환을 직접 확인해 주세요.
