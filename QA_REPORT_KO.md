# v9 QA 범위
- 12개 HTML 문서의 내부 링크, h1 개수, aria-current 존재, ID 중복 검사: 통과
- Node JavaScript 문법 검사: 통과
- Pages CMS YAML 파싱: 통과
- JSON 데이터 형식 검사: 통과
- Gallery boolean `featured`와 Home 사진 로딩: 코드/구성 정적 검사 통과
- Home 중복 사진 필드 제거, News 상세 필드 등록, Equipment 입력 3필드만 유지: 구성 검사 통과
- Chromium 실제 페이지 탐색: 실행 환경의 로컬 웹서버가 `ERR_BLOCKED_BY_ADMINISTRATOR`로 차단되어 검증하지 못함
- 실제 GitHub 배포 및 Pages CMS 계정 저장 테스트: 수행하지 않음
