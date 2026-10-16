# ACSoL Alumni 레이아웃 업데이트 (v16.1 기반)

v16.1(Students 석박통합 8기 배지 반영) + 이후 산학장학생 패치 기준입니다. **v16.2 Gallery 구조 변경은 적용하지 않았습니다.**

## 변경 내용
- 2024년 이후 Alumni: 졸업사진 + 이름, 연구 분야, 현 직장, 졸업연도. PC 7~8열/모바일 2~3열.
- 2023년 이전 Alumni: 한 사람당 1행짜리 간결한 목록(연도·이름/학위·연구분야·현 직장).
- 모든 Alumni 화면 및 CMS에서 이메일 제거.
- Alumni 사진 필드 `photo` 신규 추가 (2024년 이후 졸업생만 사용).
- 기존 Alumni 데이터의 `email` 필드는 표시되지 않지만, **공개 JSON에서 지우려면 추가 조치가 필요합니다**.

## 기본 업데이트: 기존 데이터 유지
GitHub 저장소 최상위에 `alumni.html`, `site.js`, `styles.css`, `.pages.yml` 4개를 교체합니다.
데이터 폴더나 사진 폴더는 교체하지 마세요. `site.js`와 `styles.css`의 새 코드는 v16.1의 산학장학생 및 Home 이미지 캡션 변경을 포함합니다.
CMS → People → Alumni 에 새 `2024년 이후 졸업생 프로필 사진` 필드가 생깁니다.
`data/alumni.json`의 2024년 이후 인물마다 `photo` 업로드를 하면 카드에 사진이 표시됩니다.
사진이 없으면 연구실 글자와 이니셜로 만든 자리표시자가 표시됩니다.

## 이메일을 JSON에서 실제 제거하고 싶을 때
현재 GitHub Pages는 `data/alumni.json` 파일을 공개합니다. **화면/CMS에서 이메일을 숨기는 것과 파일에서 이메일 정보를 삭제하는 것은 다릅니다.**
- 기존 Alumni 데이터를 편집한 적이 없다면 `OPTIONAL_EMAIL_REMOVAL/alumni_sanitized_v16_baseline.json`을 `data/alumni.json`으로 이름을 바꿔 업로드해 덮어쓸 수 있습니다.
- 이미 CMS에서 이름·직장·사진 등을 바꾸었다면 위 JSON으로 덮어쓰지 마세요. GitHub에서 최신 `data/alumni.json`을 내려받아 `python OPTIONAL_EMAIL_REMOVAL/strip_alumni_emails.py data/alumni.json`으로 이메일 필드만 제거한 다음 업로드하세요. 실행 전 원본 백업이 자동 생성됩니다.
- 이전 Commit에는 이메일이 남아 있을 수 있으므로, 현재 공개 파일에서 제거하는 것만으로 Git 기록 전체가 지워지는 것은 아닙니다.

## 테스트
2024년 이후 22건 / 2023년 이전 39건 기준으로 검증합니다. 실제 GitHub Pages 배포 후 홈페이지에서 최신 버전으로 새로고침해 주세요.
