# ACSoL v12 — GitHub Pages + Pages CMS

기준: ACSoL v11. 현재 GitHub에서 수정한 논문·연구원·사진은 유지하도록 **업데이트 전용 ZIP**을 사용하세요.

## v12에서 수정한 내용

1. **Research 세부 페이지 메뉴 위치**: 분야별 탭을 상세 글 맨 아래가 아니라 페이지 제목과 상세 내용 사이(상단)로 이동했습니다. 해당 목록은 `data/research.json`을 읽어 생성합니다.
2. **메뉴 목록 일치**: 모든 12개 HTML 파일이 동일한 `site.js?v=12`에서 Research 드롭다운을 생성하며, `fetch(..., {cache:'no-store'})`로 최신 `data/research.json`을 확인합니다. `data/research.json`은 업데이트 ZIP으로 덮어쓰지 않습니다. 화면에 항목이 달리 보이면 GitHub Actions의 Pages 배포가 완료됐는지 확인하고 Ctrl+F5를 해보세요.
3. **Publications의 불필요한 숫자 안내 제거**: `3 publications`, `Latest first`, 연도 옆 `N publications` 같은 보조 수치/문구를 표시하지 않습니다. 연도별 묶음과 연도 검색은 유지합니다.
4. **모집 배너**: 화면을 어둡게 하는 배경과 포스터 외곽의 흰색 카드, 장식 제목을 제거했습니다. 포스터 원본 비율을 유지하고, 바로 아래에 작게 `오늘 하루 보지 않기` 체크박스와 `닫기`를 배치했습니다. 기존 배너 날짜/숨김 동작은 유지합니다. 기존 CMS 사진은 그대로 사용합니다.
5. **Publications CMS 통합**: `Publications` 메뉴 하나에서 기존 CMS 논문과 Wix 이전 논문을 편집합니다. 아래 **일회성 병합**을 반드시 실행해야 실제 데이터도 통합됩니다. 병합 전까지 웹사이트에는 기존 두 JSON을 합쳐 표시합니다.
6. **Pages CMS 사이드바 정리**: Pages CMS 공식 `type: group` 기능으로 `01 콘텐츠 관리`, `02 페이지 제목 · 글꼴`, `03 전체 홈페이지 스타일`의 3개 접기/펼치기 그룹을 만들었습니다. 콘텐츠 내부에는 Home / Research / People / Publications / Equipment / News / Gallery / Contact 메뉴가 있습니다. Pages CMS의 자체 GUI 색상/레이아웃은 직접 재디자인할 수 없습니다.

## 1) 가장 먼저: 기존 GitHub 저장소 백업

현재 [nawit-del.github.io](https://github.com/nawit-del/nawit-del.github.io) 저장소에서 **Code → Download ZIP**으로 전체 파일을 백업하세요. 특히 `data/publications.json`, `data/publications-import.json`, `data/research.json`, `data/students.json`, `media/`를 보존합니다.

## 2) v11 → v12 업데이트 적용

1. **`ACSoL_v11_to_v12_Update_Only.zip`** 압축을 풉니다.
2. 12개 HTML, `site.js`, `styles.css`, `.pages.yml`을 기존 GitHub 저장소 최상위의 동명 파일로 교체합니다.
3. 새 `tools/merge_publications.py`, `.github/workflows/consolidate-publications.yml`을 해당 경로에 업로드합니다. 점(`.`)으로 시작하는 `.github` 폴더나 `.pages.yml`이 웹 드래그에 안 잡히면 GitHub 웹 편집기에서 `Add file → Create new file`을 이용하거나 GitHub Desktop으로 올리세요.
4. **기존 `data/*.json`과 `media/`는 건드리지 않습니다.** 업데이트 ZIP에는 기존 CMS 데이터가 들어 있지 않습니다.
5. GitHub `Actions`에서 Pages 배포가 성공하면 `Ctrl+F5` 새로고침합니다.

## 3) Publications 169건을 한 CMS 메뉴로 안전하게 병합하기 (1회 실행)

업데이트 파일만 올리면 Pages CMS 메뉴는 한 개로 정리되지만, v11에서 별도 저장했던 논문 데이터를 **실제 단일 파일**로 합치는 작업이 남습니다.

1. GitHub 저장소 → **Actions** → **One-time consolidate publications**를 엽니다.
2. **Run workflow → Branch: main → Run workflow**를 클릭합니다.
3. 워크플로가 초록색 성공(`✓`)인지 확인합니다. `tools/merge_publications.py`는 GitHub 저장소의 현재 `data/publications.json`과 `data/publications-import.json`을 읽어, DOI나 제목이 같은 항목을 중복 제거하고 기존 CMS에서 직접 수정한 값을 최대한 보존합니다.
4. 성공 후 `data/publications.json`에 기존+이전 논문이 함께 저장되고 `data/publications-import.json`은 **빈 배열 `[]`**로 비워집니다. 기존 import 내용은 GitHub 기록에 남습니다. CMS에는 **Publications 하나만** 표시됩니다.
5. 다시 Pages CMS를 새로고침하고 Publications가 모두 한 목록에 나타나는지 확인합니다.

**주의**: GitHub Actions 저장소 쓰기 권한이 제한되어 있거나 `main` 브랜치가 보호되어 있다면 자동 커밋이 실패할 수 있습니다. 이때 먼저 저장소 권한을 확인하세요. 이미 병합돼서 import 파일이 비어 있다면 워크플로는 무해하게 종료됩니다.

GitHub Actions를 사용하고 싶지 않다면, GitHub 저장소를 로컬에 복제한 후 `python tools/merge_publications.py`를 한 번 실행하고 결과 `data/publications.json`과 `data/publications-import.json`만 직접 커밋해도 됩니다. 이때 원본 JSON을 백업한 다음 진행하세요.

### 데이터가 왜 업데이트 ZIP에 포함되지 않나요?

사용자가 Pages CMS에서 추가한 논문, 학생, 연구 사진의 실제 최신 파일을 제가 볼 수 없기 때문입니다. 예전 백업 JSON을 새 파일로 덮어쓰면 최신 연구실 콘텐츠를 잃어버릴 수 있습니다. 그래서 업데이트용 ZIP은 디자인 코드와 병합 자동화 파일만 담았습니다.

## 4) CMS 메뉴 사용법

[app.pagescms.org](https://app.pagescms.org/) 로그인 → 저장소 `nawit-del.github.io` 선택 → `main` 브랜치 확인.

- **01 · 콘텐츠 관리 → Home**: 메인 문구, 모집 포스터, 노출 기간
- **Research**: 연구분야 카드/상세 사진/상세 설명 (항목 추가 시 모든 페이지의 서브메뉴에 자동 반영)
- **People**: 교수님, 경력, 수상, 재학생, 졸업생
- **Publications**: 전체 논문 1개 메뉴 (병합 완료 후 정상 사용)
- **Equipment / News / Gallery / Contact**: 각 페이지 콘텐츠
- **02 · 페이지 제목 · 글꼴**: 페이지별 큰 제목, 서브 타이틀, 글꼴/크기
- **03 · 전체 홈페이지 스타일**: 공통 글자 크기와 글꼴

CMS 자체의 테마·패널 크기·시각적 레이아웃은 이 정적 사이트의 CSS로 바뀌지 않습니다. 대신 사이드바 그룹으로 메뉴 탐색 부담을 줄였습니다.

## 5) 테스트·문제 해결

- 로컬 미리보기는 `python tools/refresh_preview.py` 실행 후 `index.html`을 열어 확인합니다. **로컬 스냅샷은 실제 GitHub의 최신 CMS 정보와 다를 수 있습니다**.
- 업데이트 후 메뉴가 4개만 뜨는 경우: GitHub 실제 `data/research.json`에 6개가 있는지 확인하고, 모든 페이지가 `site.js?v=12`를 쓰는지 확인합니다. 새 배포가 된 뒤 강력 새로고침합니다.
- 배너 이미지는 CMS 업로드 파일을 사용하며, 아직 등록한 배너가 없다면 표시되지 않습니다.
- 배너의 `오늘 하루 보지 않기`는 방문자 브라우저의 저장소(localStorage)를 사용하므로 브라우저에 따라 동작이 제한될 수 있습니다.
- `python tools/check_site.py`, `node --check site.js`로 구조 및 JS 문법을 검사할 수 있습니다.
