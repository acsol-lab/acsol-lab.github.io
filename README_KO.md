# ACSoL v13 · GitHub Pages + Pages CMS

기준: ACSoL v12. **현재 GitHub의 논문, 사진, 연구원, 배너 데이터를 보존하려면 반드시 v12→v13 업데이트 전용 ZIP을 사용하세요.**

## v13 수정 내용

1. **CMS 글꼴 설정 용어 명확화**: Publications 항목 안에 있던 모호한 `제목 / 본문`을 `논문 제목 / 저자·설명`으로 나눴습니다. `논문 제목`은 DOI 링크가 포함되는 큰 문장이고, `저자·설명`은 그 아래에 표시되는 저자명·소개 글입니다. 학술지명은 두 설정과 별도로 홈페이지 공통 디자인을 사용합니다. 다른 항목에서도 제목은 해당 항목 이름·헤드라인, 본문은 부가 설명문이라는 뜻으로 표시했습니다. `0`이나 빈 값은 해당 페이지의 기본 크기를 사용합니다.
2. **연도 필터 압축**: 상단 필터는 `All years / 2026, 2025, ... 2020 / 2010년대 / 2000년대 / Under Review`입니다. 2010년대는 2010~2019, 2000년대는 2000~2009를 포함합니다. 검색/연도별 본문 묶음과 날짜 최신순 정렬은 유지합니다. 2000년 이전 자료가 실제로 있으면 `Before 2000`이 별도로 표시됩니다.
3. **상태 필드 단순화**: CMS에서 `현재 상태 — Under Review (심사 중이면 체크)`만 사용합니다. 선택하면 항목에 `Under Review` 배지가 표시되고 상단 Under Review 필터에서도 확인할 수 있습니다. 미선택 항목은 상태 배지를 표시하지 않습니다. 이전 JSON의 `status` 필드는 삭제하지 않습니다. `Under Revision`과 `Accepted`는 별도의 Under Review 배지로 잘못 변환하지 않습니다.
4. **CMS의 항목 종류 필드 제거**: 기존 `publicationType` 내용은 JSON에 남겨 두지만 Pages CMS 입력란에서 숨겼습니다. 기존 Book Chapter 데이터도 없어지지 않습니다.
5. **저널명 확대**: Publications의 저널명을 PC 18px, 모바일 16px의 굵은 글씨로 표시합니다. 실제 논문 제목은 19px 전후(화면 크기에 따라 변함)이며 저널명도 비슷한 크기로 보입니다.
6. **모집 배너 디자인 개선**: 화면 정중앙 대신 **PC 우측 상단**에 작은 안내 포스터 카드로 표시합니다. 얇은 테두리·연한 배경·그림자와 상단 `ACSoL / ANNOUNCEMENT` 라벨을 적용했습니다. 배너 이미지의 전체 비율은 유지하며, 아래에 `오늘 하루 보지 않기`와 `닫기`를 작게 표시합니다. 모바일에서는 화면 너비에 맞춰 상단 중앙으로 배치됩니다. CMS의 배너 이미지/기간/링크 값은 변경하지 않습니다.

## GitHub에 적용하기

1. 저장소 `nawit-del.github.io`에서 **Code → Download ZIP**으로 먼저 백업합니다. 특히 `data/publications.json`, `data/publications-import.json`, `data/banners.json`, `data/students.json`, `media/`를 보존합니다.
2. `ACSoL_v12_to_v13_Update_Only.zip`의 파일을 압축 해제합니다.
3. HTML 12개, `site.js`, `styles.css`, `.pages.yml`, `tools/migrate_review_flags.py`, `.github/workflows/migrate-review-flags.yml`을 GitHub 저장소 최상위의 동일한 경로로 업로드·교체합니다.
4. **data 폴더 전체와 media 폴더는 교체하거나 삭제하지 마세요.** 업데이트 ZIP에 사용자 JSON 데이터는 포함되지 않습니다.
5. GitHub → Actions에서 Pages 배포가 성공한 후 홈페이지와 Pages CMS를 새로고침합니다. 브라우저 캐시가 남으면 `Ctrl+F5`로 새로고침합니다.

## 기존 Under Review 기록 체크박스 초기화 (권장 · 한 번만)

과거에는 논문 상태가 `status: "Under Review"`로 저장되었지만 v13부터는 `underReview: true/false` 체크박스를 사용합니다. 홈페이지는 **새 필드가 없을 때만** 예전 `status` 값을 읽으므로 업데이트 직후에도 배지가 올바르게 보입니다. 그러나 Pages CMS 체크박스를 수정할 때 혼동이 없도록 다음 중 하나를 실행하세요.

- GitHub → **Actions → One-time normalize Under Review flags → Run workflow**를 한 번 실행합니다. 이 자동화는 `data/publications.json` (및 아직 병합 전이면 `data/publications-import.json`)에서 기존 `Under Review` 항목만 참으로 변환하고 나머지를 거짓으로 채웁니다. 이전 상태·논문명·연도·DOI는 삭제하지 않습니다. 이미 `underReview` 값이 설정된 논문은 건드리지 않습니다. Actions의 `GITHUB_TOKEN`에 저장소 쓰기 권한이 필요할 수 있습니다.
- 또는 Pages CMS에서 Under Review 논문을 열어 체크하고 저장합니다. 과거 `status` 필드가 남은 경우 **해제하여 저장하면** `underReview: false`가 우선하므로 홈페이지 배지가 없어집니다.

**v12의 Wix 논문 데이터 통합 작업을 아직 수행하지 않았다면**, 먼저 v12의 `One-time consolidate publications` 워크플로를 완료하고 나서 체크박스 초기화 작업을 하세요. 홈페이지 목록은 이전 자료 파일을 병합 전까지 읽어 표시하지만, Pages CMS의 Publications 메뉴는 `data/publications.json`을 편집하므로 병합이 먼저 필요합니다.

## 확인 사항

- 필터가 2000년대/2010년대/2020년 이후 연도별로 표시되는지, `Under Review`가 연도 버튼 옆에 나타나는지 확인합니다.
- 논문 목록의 `Under Review` 배지가 심사 중인 논문에만 표시되는지 확인합니다.
- CMS에서 논문을 열었을 때 `논문 제목 글꼴`, `저자·설명 글꼴`, `Under Review` 체크박스만 표시되고 `항목 종류` 입력란이 없는지 확인합니다.
- 배너가 노출 기간에 우측 상단 카드 형태로 나타나는지 확인합니다. 방문자별 하루 숨김 데이터는 브라우저 저장소에 남으므로 시크릿 창에서 테스트하는 것이 편리합니다.

## 주의

Pages CMS는 별도의 서비스이므로 이 홈페이지의 CSS로 CMS 관리자 화면 자체의 색상·형태를 바꾸지는 못합니다. 이번에는 **CMS 항목의 이름과 설명 문구를 개선**했습니다. 변경 후 화면에 구 설정이 보이면 Pages CMS에서 저장소와 `main` 브랜치를 다시 선택·새로고침하세요.
