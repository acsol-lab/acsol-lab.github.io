# ACSoL 연구실 홈페이지 v16.1 — 산학장학생 표시 및 Home 사진 제목 개선

기준: **v16.1 (Students 학위과정·기수 통합 배지)**. 앞서 요청한 Research 요약/상세 사진 분리 기능도 유지합니다. 거절한 Gallery v16.2 변경사항은 포함하지 않습니다.

## GitHub에 업로드하여 교체할 파일
- `.pages.yml`
- `site.js`
- `styles.css`
- `students.html`
- `index.html`
- `research.html`, `research-detail.html` (이전 Research 사진 분리 패치와 캐시 버전 통일용)
- `assets/samsung-scholarship-logo.png` (신규)
- `assets/skhynix-scholarship-logo.png` (신규)

**기존 `data/`, `media/`, `gallery.json`, `students.json` 등의 데이터는 변경하거나 삭제하지 마세요.**

## Pages CMS 사용법
1. Pages CMS → People → 재학생 명단으로 이동합니다.
2. 해당 학생을 선택합니다.
3. `산학장학생 구분 (학생 카드에 기업 로고 표시)` 항목을 `없음`, `삼성 산학장학생`, `SK하이닉스 산학장학생` 중 선택합니다.
4. 저장하면 학생 카드에서 기존 이름·학위/기수 배지 옆에 기업 로고와 `산학장학생` 문구가 나타납니다.

기존 학생은 `scholarshipCompany` 값이 없으므로 선택하지 않은 상태와 동일하게 표시하지 않습니다.

## Home 사진 아래 제목 변경
기존 Gallery 사진의 `title`이 메인 사진 하단에 **15~17px 굵은 제목**으로 표시되고 날짜는 **12px**로 우측 정렬됩니다.
CMS의 Gallery 사진 제목을 수정하면 홈 캡션도 갱신됩니다. 원래 사진 위치와 슬라이드 기능은 변경하지 않았습니다.

## 참고
PPT의 삼성·SK하이닉스 로고 이미지를 잘라 웹용으로 포함했고, 산학장학생 문구는 가독성을 위해 HTML 텍스트로 별도 표기합니다.
