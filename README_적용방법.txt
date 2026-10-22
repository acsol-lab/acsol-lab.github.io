ACSoL Contact + Pages CMS 수정본 (2026-10-22)

[이전 다운로드 파일과 달라진 점]
Contact 가운데 모집 포스터가 이제 Pages CMS에서 교체 및 표시/숨김 설정 가능합니다.
오른쪽 Principal Investigator 등 카드의 제목도 Pages CMS에서 직접 수정할 수 있습니다.

[압축파일 적용]
이 ZIP의 내용을 GitHub Pages 저장소 최상위에 동일 경로로 덮어씁니다.
기존 미디어·기타 페이지 파일은 그대로 유지됩니다.

변경/신규 파일:
- .pages.yml              : Pages CMS 수정 메뉴
- data/page-contact.json   : CMS로 수정할 Contact 상세 설정
- contact.html             : 포스터와 문구 표시 위치
- contact-layout.css       : 가운데 포스터 ON/OFF 배치
- site.js                  : CMS 값을 실제 화면에 반영
- preview-data.js          : file:// 로컬 미리보기용 데이터
- media/contact/acsol-recruitment-2026.jpg : 기본 모집 포스터

[Pages CMS에서 수정하는 방법]
1) 02 · 페이지 제목 · 글꼴 > Other pages > Contact > 페이지 문구 · 중앙 포스터 · 글꼴 · 크기
   - 가운데 모집 포스터 사진 업로드 · 교체
   - 가운데 모집 포스터 표시 여부
   - 포스터 이미지 설명/하단 캡션
   - 왼쪽 Get in touch, 오른쪽 연락처 카드 제목 변경
   - 페이지 상단 제목·소개 문구·글꼴 및 크기
2) 01 · 콘텐츠 관리 > People · 구성원 > 교수님 프로필
   - 교수님 이름·이메일·연구실 주소 및 전화번호 수정
3) 01 · 콘텐츠 관리 > Contact · 연락처 > 학생 대표 · 찾아오는 길
   - 학생 대표 연락처 및 찾아오는 길 수정

참고: 좌/중/우 3열 레이아웃의 위치·넓이는 CSS로 설정되며 CMS에서 직접 수정할 수 없습니다.

확인: YAML/JSON/JavaScript 문법, CMS 필드 및 화면 연결, 포스터 교체/숨김 동작 자동 테스트 통과.
