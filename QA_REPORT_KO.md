# ACSoL v14 로컬 검증 요약

- GitHub Pages의 `index.html` 등 12개 HTML 파일이 모두 존재하고 스타일/스크립트 버전 `v=14`로 통일됨.
- `node --check site.js` 통과, YAML 파싱 통과.
- 로컬 Chromium 렌더링 테스트에서 서로 다른 팀 3개(6명/5명/1명) 생성, 5열 데스크톱 그리드, 2열 모바일 그리드 확인.
- 학위과정 배지 3종 표시, 기존 `role: phd` 학생과 팀이 없는 학생 표시 확인.
- 학생 기수 15px 표시, 모바일 가로 넘침/자바스크립트 예외 없음.
- Publications의 `2010~2019`, `~2009`, `Under Review` 필터 라벨 확인.
- Under Review 필터의 border radius, 글꼴 크기/굵기, 기본 테두리, 여백이 다른 연도 버튼과 일치하는지 확인.
- 학술지명은 기존 teal 변수 `#187875`로 표시되는 것 확인.
- 기존 실제 CMS 데이터가 업데이트 ZIP에 포함되지 않도록 점검함.
- 미검증: 실제 GitHub Pages 배포 및 Pages CMS에서 수정 후 Commit 연동.
