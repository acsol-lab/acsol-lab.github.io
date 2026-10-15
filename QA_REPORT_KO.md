# ACSoL v8 QA

- HTML 페이지: 12개 (기존 7개 + 5개: professor/students/alumni/research-detail/equipment)
- CMS JSON: 13개 (기존 11개 + contact/equipment)
- `.pages.yml` YAML 파싱: 통과, 메뉴 12개
- JavaScript 구문 검사 `node --check site.js`: 통과
- CSS `tinycss2` 파서: 구문 오류 0건
- HTML/정적 참조 검사 `python tools/check_site.py`: 통과
- 실제 DOM 동작/반응형 브라우저 확인: 미완료 (현재 실행 환경의 로컬 페이지 접근 제한)
- GitHub Pages 배포/Pages CMS 실제 저장 테스트: 미수행

**기존 데이터 안전성:** 업데이트 전용 ZIP에는 이미 운영 중일 수 있는 `data/home.json`, `data/professor.json`, `data/research.json`, `data/students.json`, `data/alumni.json`, `data/publications.json`, `data/news.json`, `data/gallery.json` 및 경력/수상 JSON 파일이 포함되지 않습니다. 새롭게 필요한 빈 장비 데이터와 학생 대표 연락처 데이터만 포함됩니다.
