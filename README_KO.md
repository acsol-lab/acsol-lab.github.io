# ACSoL CMS v5 — GitHub Pages / Pages CMS

## 이번 업데이트

- Publications: `publishedDate` (YYYY-MM-DD) CMS 날짜 입력. 연도별 그룹을 최신 연도순으로 배치하고 같은 연도 논문을 날짜 최신순으로 정렬합니다. 날짜가 없는 이전 데이터는 기존 `year`로 그룹화하고 같은 연도 맨 아래에 표시합니다. 정확한 출판일을 추정하지 않습니다.
- Research: 연구 분야 카드를 클릭하거나 Enter/Space를 누르면 같은 페이지 내에서 상세 영역이 펼쳐집니다. 다른 카드를 열면 이전 카드가 닫힙니다.
- CMS: `Research / 연구 분야 · 펼침 상세 내용`에서 `detailIntro`와 `detailSections`(반복 가능한 제목/글/이미지/캡션) 관리.
- 기존 Home, People, News, Gallery, Contact 및 학생·교수님·논문 데이터는 유지합니다.

## 이미 v4가 운영 중인 경우 (추천)

1. 저장소를 백업합니다.
2. `ACSoL_CMS_v4_to_v5_update_only.zip`을 압축 해제합니다.
3. 아래 수정된 파일만 저장소의 최상위에 업로드/교체합니다.
   - `.pages.yml`
   - `site.js`
   - `styles.css`
   - 7개 HTML 파일 (CSS/JS 캐시 버전 `?v=5` 반영)
4. **기존 `data/` 폴더 및 `media/` 폴더를 삭제/덮어쓰기 하지 않습니다.** 특히 이미 CMS에서 편집한 `data/publications.json`, `data/research.json` 그대로 둡니다.
5. `.pages.yml`은 파일명이 점(.)으로 시작하므로 GitHub 웹 편집기에서 내용을 교체하거나 GitHub Desktop으로 반영합니다.
6. GitHub `Actions` 탭에서 Pages 배포 성공 확인 후 `Ctrl+F5`로 접속합니다.
7. Pages CMS 새로고침 → Publications에 새 출판일 항목, Research에 상세 내용 항목이 보이는지 확인합니다.

## CMS 사용 방법

### Publications

1. Pages CMS → `Publications / 출판 날짜 · 논문`
2. 논문 항목의 `정확한 출판일`에 YYYY-MM-DD 입력 (예: 2026-10-01)
3. 저장하면 배포 후 연도 그룹 및 날짜순 자동 정렬됩니다.
4. 기존 `year` 값은 예전 논문의 날짜를 모를 때만 사용합니다. 둘 다 있으면 `publishedDate`가 우선합니다.
5. Pages CMS 날짜 필드를 **비워도 기본으로 오늘 날짜가 들어가지 않게 설정**했습니다. 실출판일을 확인해서 입력하세요.

### Research

1. Pages CMS → `Research / 연구 분야 · 펼침 상세 내용`
2. 기존 title / subtitle / description / keywords / image는 카드의 요약 정보입니다.
3. `펼쳤을 때 나오는 상세 도입 설명`에 긴 소개 문구를 입력합니다.
4. `추가 상세 내용`에서 `Add item`으로 항목을 추가합니다. 각 항목마다 제목/글/사진/사진 캡션을 독립적으로 입력할 수 있습니다. 여러 개를 추가하면 순서대로 배치됩니다.
5. 이미지는 Pages CMS에 업로드하면 `media/` 폴더로 저장되어 표시됩니다. 기존 Wix 이미지 URL은 필요 없습니다.
6. **이전 research.json은 그대로 사용할 수 있습니다.** 새 필드는 CMS에서 편집하고 저장할 때 추가됩니다.

## 문제 해결

- 변경 전 모습만 보이면 페이지 새로고침(Ctrl+F5), HTML 파일의 `site.js?v=5`와 `styles.css?v=5` 확인
- CMS에 필드가 안 보이면 `.pages.yml`을 v5로 교체했는지 확인
- Research/Publication에 `불러오는 중`이 지속되면 Network 탭에서 `data/research.json`, `data/publications.json` HTTP 200 여부 확인
- JSON을 로컬 파일로 열지 말고 GitHub Pages 사이트 주소에서 테스트
