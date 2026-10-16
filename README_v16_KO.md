# ACSoL v16 — GitHub Pages · Pages CMS 업데이트

이 버전은 **기존 v15.1 홈페이지**를 기준으로 합니다. 홈·학생·논문 데이터를 삭제하지 않습니다.

## 변경 기능

1. 모집 안내 배너는 화면 오른쪽 사진 위가 아닌, PC에서는 메인 문구 근처의 왼쪽 상단에 배치했습니다. 배너 상단의 **ACSoL / ANNOUNCEMENT · 드래그하여 이동** 부분을 마우스로 잡아 옮길 수 있습니다. 배너는 다른 페이지를 가리지 않는 비모달 방식이며, '오늘 하루 보지 않기'·닫기 기능은 유지합니다. 초기 위치는 좌측 12vw(최대 230px), 상단 17vh(최대 170px)입니다. 이동 위치는 다음 방문까지 저장되지 않고 방문자 개별 화면에서만 적용됩니다.
2. 모바일 홈 화면: 연구실 소개와 `Explore our research` 다음에 대표 사진이 **컨테이너 가로폭을 채워서** 나타나도록 배치했습니다. 모바일에서 사진 비율은 4:3으로 설정했습니다.
3. Students: 기존 `photo` 필드는 **기본 증명사진**으로 사용하고, `casualPhoto` 필드를 추가했습니다. 일상사진이 등록된 학생에게 마우스를 올리거나 키보드 포커스를 주면 자연스럽게 전환됩니다. CMS → 학생 관리에서 '증명사진', '일상사진'을 설정하세요.
4. Publications: **Under Review 논문은 `All years` 및 연도/기간별 필터에서 제외**하고, `Under Review` 필터에서만 표시합니다. 기존 데이터는 변경하지 않습니다.
5. Alumni: Wix `members` 페이지의 Alumni(2011~) 목록을 `data/alumni.json`에 **61개 이력 항목**으로 옮겼습니다. Postdoctoral Fellow 8건, 학위/수료 관련 항목 53건입니다. 하나의 인물이 석사와 박사 또는 Postdoc 경력에 복수 등장하는 경우는 **서로 다른 이력으로 유지**했습니다. 기존 Alumni 데이터는 교체됩니다.
6. Equipment: 요청하신 ASMDDC 장비 사이트는 원문 페이지를 가져올 때 오류가 발생하여 **검색 결과로 확인된 장비명 6개만 부분적으로 옮겼습니다.** 모델명은 확인 불가하여 공란입니다. 따라서 **전체 장비 목록이 아닙니다.** 기존 Equipment 데이터가 교체되는 점에 유의하세요. 사이트는 ACSoL과 다른 한양대 연구소(박재근 교수 소속)로 분류되므로 우리 연구실의 직접 보유 장비인지 확인 후 공개하세요.

## GitHub 적용 방법

**먼저 GitHub 저장소와 `data/alumni.json`, `data/equipment.json`을 별도 백업**하세요.

`ACSoL_v15_1_to_v16_Update_Only.zip`을 압축 해제하고 저장소 최상위에 다음을 업로드/덮어쓰세요.
- `styles.css`, `site.js`
- 12개 HTML 파일 (공유 CSS·JS 캐시 갱신)
- `.pages.yml` (Pages CMS 일상사진 입력란 추가)
- **`data/alumni.json` — 기존 Alumni 내용 전체 교체**
- **`data/equipment.json` — 확인된 6개 항목으로 교체(부분 목록)**

**`data/students.json`, `data/publications.json`, `data/gallery.json`, `data/news.json`, `data/research.json`, `data/banners.json`, `media/` 등은 덮어쓰거나 삭제하지 마세요.**

업로드 후 GitHub의 Actions / Pages 배포가 완료된 것을 확인하고, 브라우저에서 `Ctrl+F5`를 눌러 최신 코드로 새로고침하세요. Pages CMS도 새로고침하여 Students의 일상사진 필드가 생겼는지 확인하세요.

## 테스트 및 미확인 사항

- JavaScript `node --check`, Pages CMS YAML 파싱, JSON/HTML/메뉴 경로의 정적 검사 통과.
- 자동 브라우저 테스트는 작업 환경이 로컬/테스트 페이지 탐색을 차단해 완료하지 못했습니다. 실제 GitHub Pages에서 (1) 모바일 사진 위치, (2) 배너 드래그, (3) 학생 사진 Hover, (4) Under Review 필터를 확인해야 합니다.
- Alumni 원본 페이지에는 일부 이메일의 중복·문자열 오류 또는 취업 정보 공란이 있습니다. 해당 정보는 새 이메일을 추측하지 않고 비워둔 경우가 있습니다.
- 모델명을 포함한 **장비 전체 목록을 완성하려면** 원본 ASMDDC 페이지의 PDF 출력 또는 캡처/HTML 파일을 제공해 주세요. 그 자료를 기준으로 전체를 정확하게 이전할 수 있습니다.

## 참조 사이트

- Alumni: https://jinsubpark37.wixsite.com/acsol/members
- Equipment: https://asmddc.hanyang.ac.kr/equipment (현재 전체 페이지 접근 실패; 검색 결과로 6개 확인)
