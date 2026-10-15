# ACSoL v9 — v8 디자인 개선 / GitHub Pages + Pages CMS

## v9 주요 변경사항

1. **Research 메뉴:** 작은 `⌄` 기호 삭제. 메뉴 글자 `Research` 클릭하면 드롭다운이 열립니다. 맨 위의 **All Research · 전체 연구 분야**로 개요 페이지에 이동하거나 네 개 세부 분야로 바로 갈 수 있습니다. 바깥을 클릭하거나 Esc를 누르면 닫힙니다.
2. **People:** 메뉴 글자 클릭 시 `professor.html`로 바로 이동합니다. PC에서 마우스를 올리면 Professor / Students / Alumni 하위 메뉴가 부드럽게 열립니다. 모바일에서는 메뉴 안에 세 페이지 링크를 항상 표시합니다.
3. **Publications:** 연도 그룹 간격과 논문 행의 위아래 간격·제목 여백을 축소했습니다. 연도별 최신순 정렬은 유지합니다.
4. **Equipment:** 장비 사진 바로 아래 장비 이름과 모델명을 표시합니다. Pages CMS에서는 `name`, `model`, `photo` 세 항목만 입력합니다. 기존 JSON에 제조사/설명 등의 값이 남아 있더라도 화면에는 표시하지 않습니다.
5. **News:** 행 간격을 줄이고 오른쪽 `Expand` 버튼을 추가했습니다. `detailBody`(긴 글), `detailImage`(사진), `detailCaption`을 CMS에서 관리합니다. 내용이 없는 기존 소식은 클릭 시 추가 상세 내용 준비 중 안내가 표시됩니다. 홈에서 `Read the story`를 누르면 해당 소식이 자동으로 펼쳐집니다.
6. **Home 슬라이드:** `Gallery / 사진` 항목에서 **★ 메인 화면 슬라이드에 표시 (즐겨찾기)** 토글을 켠 사진만 홈 슬라이드에서 사용합니다. 다른 사진은 Gallery에만 나타납니다. **Home / 메인 화면 설정**에는 사진 입력란이 없어지고 자동 전환 간격(초)만 남습니다. 사진 순서는 Gallery의 항목 순서입니다. 즐겨찾기가 0장이면 기본 추상 이미지가 보이므로 게시 전에 1장 이상 선택하세요.
7. **슬라이드 컨트롤:** 기존 점·재생/정지 버튼 제거. 사진의 좌우 가장자리에 마우스를 올리면 그라데이션과 화살표가 나타납니다. 자동 순환은 항상 켜져 있으며 방문자가 이전/다음을 눌러도 계속 순환합니다. 터치 기기에서는 버튼을 부드럽게 표시하고 좌우 스와이프를 지원합니다.
8. **메인 버튼과 Contact:** 동그라미 화살표를 작고 통합된 버튼으로 변경했습니다. `Explore our research`와 `Send an email` 모두 동일한 디자인입니다.
9. **Home 하단:** `Advanced Convergence ...` 및 `Latest news ↓`가 있는 불필요한 두 줄 구역 제거.
10. **Home 숫자:** `01 / The laboratory` → `The laboratory`, `02 / Latest from ACSoL` → `Latest from ACSoL`.
11. **한글 글꼴:** 오픈 라이선스 **Pretendard Variable** 동적 서브셋 웹폰트를 HTML에 적용했습니다. 네트워크가 없거나 CDN이 차단되면 운영체제 글꼴로 자동 대체됩니다. 폰트 파일 자체는 ZIP에 포함하지 않습니다.

## v8 저장소를 v9로 업데이트하는 방법

`ACSoL_v8_to_v9_Update_Only.zip` 압축 해제 후:

1. GitHub 저장소를 `Code → Download ZIP`으로 미리 백업합니다.
2. HTML 12개, `site.js`, `styles.css`를 기존 저장소 최상위에 교체합니다.
3. **`.pages.yml`을 반드시 교체**합니다. 점으로 시작하는 파일은 브라우저 업로더에서 막힐 수 있어 GitHub에서 해당 파일의 편집(연필) 버튼을 눌러 붙여넣는 방법을 권장합니다.
4. **기존 `data/`, `media/`를 삭제하거나 전체 파일로 덮어쓰지 마세요.** 이미 저장한 학생·논문·연구 분야·사진·수상·장비 등의 데이터가 들어 있습니다. 새 기능의 추가 필드는 기존 JSON에 없어도 자동 처리합니다.
5. `Settings → Pages`에서 `main` / `/(root)` 배포를 확인하고 `Ctrl+F5`로 강력 새로고침합니다. HTML의 CSS/JS 버전 쿼리를 `?v=9`로 변경했으므로 오래된 캐시의 영향을 줄였습니다.
6. Pages CMS에서 Gallery의 사진 몇 장에 즐겨찾기 옵션을 **true**로 설정하고 저장합니다. 사진 파일은 `/media/` 경로여야 합니다.
7. Pages CMS에서 News 항목 하나의 `펼침 상세 내용`을 입력하고 저장한 뒤 홈페이지에서 버튼을 확인합니다.
8. Equipment CMS는 이제 **장비 이름·모델명·사진**만 입력하면 됩니다.

## 중요: 기존 메인 사진을 홈에서 보이게 하려면

v8에서는 `data/home.json`의 `heroSlides` 또는 `heroImage`로 홈 사진을 관리했습니다. **v9는 이 필드를 읽지 않습니다.** 사진을 다시 업로드할 필요 없이, Pages CMS → Gallery에서 **이미 등록된 사진을 선택해 즐겨찾기만 활성화**하면 됩니다. 만약 Gallery에 등록되지 않은 홈 전용 사진이라면 먼저 Gallery 항목으로 추가하세요. `media/`에 파일이 있어도 Gallery 목록에 등록되지 않으면 자동 표시되지 않습니다.

## 본 배포와 테스트의 차이

`preview-data.js`는 컴퓨터에서 HTML을 직접 더블클릭해 볼 때만 사용하는 샘플 데이터입니다. 실제 `https://...github.io` 웹사이트는 GitHub의 `data/*.json`을 직접 읽습니다. 실제 저장소의 JSON과 로컬 미리보기의 내용이 다를 수 있습니다.

`node --check site.js`, `python tools/check_site.py`, YAML 및 JSON 구조 검사는 통과했습니다. 이 환경의 Chromium에서 로컬 웹 서버 주소가 차단되어 PC·모바일 브라우저의 실제 클릭/슬라이드 시연 검사는 완료하지 못했습니다. GitHub 배포 후 화면 동작 확인이 필요합니다.
