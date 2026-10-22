ACSoL 홈페이지 — Contact 메뉴 독립 항목 수정본 V3 (2026-10-22)

■ Pages CMS 왼쪽 메뉴가 이렇게 바뀝니다
01 · 콘텐츠 관리
 └ Contact · 연락처
    ├ 학생 대표 · 찾아오는 길          (기존 항목 유지)
    └ 모집 포스터 · 카드 문구         (신규 독립 항목)

새 '모집 포스터 · 카드 문구'에서 수정할 수 있는 내용:
- 가운데 모집 포스터 이미지 업로드 / 교체
- 포스터 표시 여부 ON/OFF
- 포스터 대체 설명과 하단 안내 문구
- 왼쪽 Get in Touch 상단 문구
- 오른쪽 연락처 카드 6개의 제목

페이지 제목과 글꼴 등은 기존 02 메뉴에서 계속 수정합니다.

■ 필수 적용 방법 — ZIP 자체를 업로드하지 마세요
1. ZIP 파일의 압축을 푼 후 나온 파일들을 확인합니다.
2. github.com/acsol-lab/acsol-lab.github.io 저장소의 main 브랜치 루트에
   압축 해제한 파일을 동일한 경로로 덮어쓰기/추가합니다.
   (GitHub Desktop 사용 시 로컬 Clone 폴더에 덮어쓰고 Commit + Push)
3. .pages.yml 파일은 숨김파일이므로 반드시 포함하세요.
4. 새 data/contact-display.json 파일을 반드시 추가하세요.
5. 새로고침(Ctrl+Shift+R)하여 app.pagescms.org의 왼쪽 메뉴를 펼칩니다.
6. 01 · 콘텐츠 관리 > Contact · 연락처 > 모집 포스터 · 카드 문구를 클릭하여
   원하는 사진/문구를 변경하고 우측 상단 Save를 누르세요.
7. GitHub Pages 배포 후 Contact 페이지를 강력 새로고침하세요.

■ 수정 또는 추가되는 파일 경로
 .pages.yml
 data/contact.json
 data/contact-display.json           (신규)
 data/page-contact.json
 site.js
 contact.html
 preview-data.js
 contact-layout.css
 media/contact/acsol-recruitment-2026.jpg

■ 참고
- 이 ZIP은 기존 레포지토리 전체가 아닌 '수정 및 신규 파일'만 들어 있습니다.
- ZIP 업로드만으로 GitHub에 반영되지 않으며, 반드시 저장소 main에 파일을 업로드해야 합니다.
- .pages.yml의 JSON 항목은 서로 다른 파일로 분리돼 각자 저장할 수 있습니다.
- 기존 학생 대표 연락처 값과 원본 포스터 이미지는 보존했습니다.
