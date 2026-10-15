# ACSoL 홈페이지 v11 (GitHub Pages + Pages CMS)

기준: 기존 ACSoL v10 홈페이지. 2026-10-15 기준 업데이트.

## 이번 업데이트 내용

1. Research의 하위 메뉴는 `data/research.json`을 읽어 자동 생성됩니다. CMS에서 항목을 추가/삭제하면 메뉴에도 자동 반영됩니다. Research 상위 메뉴는 개요 페이지로 이동합니다.
2. Publications 페이지의 `N publications / Latest first` 구분선을 제거했습니다.
3. 교수님 Employment/Awards의 왼쪽 날짜/기간 표시를 키우고 각 행의 중앙에 맞췄습니다.
4. Home의 News 카드 양쪽에 이전/다음 버튼을 추가했습니다. PC 3개, 태블릿 2개, 휴대전화 1개씩 보여주며 다음/이전 항목으로 순환합니다.
5. 기간 지정 사진 배너를 만들었습니다. Pages CMS의 **Home / 기간 지정 모집 · 안내 배너**에서 이미지, 배너 제목, 시작일, 마지막 날, 링크(선택)를 등록합니다. **대한민국 표준시(Asia/Seoul)** 날짜로 시작일과 종료일을 포함하여 표시합니다. 기본값 `data/banners.json`은 빈 배열이라 배너가 뜨지 않습니다.
6. 배너에는 **오늘 하루 보지 않기** 체크박스가 있습니다. 체크한 뒤 닫으면 같은 브라우저의 `localStorage`에 한국 날짜가 저장되어 다음 한국 날짜가 될 때까지 해당 배너를 표시하지 않습니다. 체크하지 않고 닫으면 현재 브라우저 탭의 세션 동안 숨깁니다. 브라우저별로 저장되며 비공개 모드/쿠키/스토리지 차단 환경에서는 동작이 제한됩니다.
7. 기존 Wix Publications 목록에서 확인한 SCI(E)/학회 164개 + Book Chapter 5개, 총 169개 목록을 `data/publications-import.json`에 추가했습니다. **제목은 원어 그대로** 표시합니다. DOI가 같은 v10의 한국어 요약형 논문 3개는 새 원어 제목을 우선 표시하여 중복이 나타나지 않도록 했습니다.

## 논문 데이터 주의 사항

- 출처: https://jinsubpark37.wixsite.com/acsol/publications (2026-10-15 확인).
- 기존 v10에서 입력한 `data/publications.json`은 덮어쓰지 않습니다. 사이트는 `publications-import.json`과 기존 `publications.json`을 합쳐 표시합니다.
- Pages CMS에서 기존 직접 추가한 논문은 **Publications / 출판 날짜 · 논문**, Wix에서 이전한 논문은 **Publications / Wix 이전 논문 (원어·연도)** 메뉴에서 편집할 수 있습니다.
- 정확한 출판일이 명확히 확인된 항목 20건에만 `publishedDate`를 넣었습니다. 다른 항목은 `year`만 있으며 임의 날짜를 만들지 않았습니다.
- **Under Review / Under Revision / Accepted** 항목은 정식 출판물과 구분해 상태를 표시합니다. 논문 제목이 등록됐다고 실제 출판된 것은 아닙니다.
- 일부 구형 논문의 원본 웹페이지에서 저자·DOI·세부 서지를 자동 추출/검증하기 어려워 명확히 확인한 부분만 필드에 추가했습니다. 제목 169건과 연도, 소스에 명시된 학술지/출처는 모두 포함됩니다. 발행 연도와 저널명을 포함해 정식 게시 전 최종 확인하세요.
- 원본 Wix에 있는 오탈자(특히 예전 영문 제목)는 임의 번역하거나 완전히 재작성하지 않았습니다. 이력은 CMS에서 수정 가능합니다.
- Book Chapter도 Publications 목록에 함께 나타납니다(`publicationType=book`).

## v10 → v11 업데이트 적용 방법 (권장)

1. GitHub 저장소 `nawit-del.github.io`에서 `Code → Download ZIP`으로 먼저 백업합니다.
2. **`ACSoL_v10_to_v11_Update_Only.zip`** 파일을 압축 해제하여 내용물을 GitHub 저장소 최상위에 올립니다.
3. `site.js`, `styles.css`, 12개 HTML을 같은 이름으로 덮어쓰고, `.pages.yml`도 **파일 전체를 새 설정으로 변경**합니다. `.pages.yml`은 숨김 파일이므로 GitHub 웹 편집기의 연필 버튼을 이용해 파일 전체를 교체할 수 있습니다.
4. `data/banners.json`과 `data/publications-import.json`을 새로 추가합니다. 두 파일을 `data/` 폴더 내부에 올려야 합니다.
5. **기존 `data/publications.json`, `data/news.json`, `data/research.json`, `data/home.json`, `data/students.json`, `media/`는 삭제하거나 덮어쓰지 마세요.**
6. GitHub의 `Actions`에서 Pages 배포가 성공했는지 확인하고, 홈페이지를 `Ctrl+F5` 새로고침합니다. Pages CMS도 다시 열어 새 메뉴를 확인합니다.
7. `Research` 메뉴 Hover를 시험하고, CMS에서 연구 분야를 추가해 메뉴가 자동으로 늘어나는지 확인합니다. 모집 배너는 이미지/날짜를 지정해야 처음 나타납니다.

## Pages CMS 모집 배너 등록 예시

| 필드 | 예시 |
|---|---|
| 배너 고유 ID | `recruit-2027-spring` |
| 사용 여부 | `true` |
| 제목 | `2027학년도 전기 신입생 모집` |
| 이미지 | Pages CMS에서 JPG/PNG/WebP 사진 업로드 (`media/`에 저장) |
| 시작 날짜 | `2026-11-01` |
| 마지막 날짜 | `2026-11-30` |
| 링크(선택) | `https://...` 또는 홈페이지 내부 지원 페이지 |

날짜 양 끝을 모두 포함하여 표시합니다. 여러 배너를 동시에 활성화했다면 순서대로 하나씩 보이고, 닫으면 다음 배너가 표시됩니다.

## 로컬 미리보기

- HTTP(S) GitHub Pages는 항상 GitHub의 실제 JSON을 읽습니다. 로컬 `file://` 미리보기에서는 `preview-data.js`를 사용합니다.
- 로컬 데이터까지 미리보려면 수정 후 `python tools/refresh_preview.py`를 실행하여 미리보기 스냅샷을 갱신해야 합니다.
- 업데이트 ZIP에는 기존 데이터를 덮어쓰는 일이 없도록 `preview-data.js`를 포함하지 않았습니다. 전체 사이트 ZIP에는 포함되어 있습니다.

## 간단 점검

`python tools/check_site.py` / `node --check site.js` 명령어로 파일 구조 및 JavaScript 문법을 점검할 수 있습니다.
