# ACSoL 연구실 홈페이지 — GitHub Pages + Pages CMS 스타터

이 패키지는 사용자가 제공한 `index.html`에 데이터 기반 논문 / 뉴스 / 갤러리 표시 기능을 연결한 예시입니다.
원본 HTML의 구조 및 스타일을 대부분 유지합니다. 홈페이지의 기존 링크 일부는 예전 Wix 사이트로 향하므로 추후 교체하세요.

## 구성
- `index.html` : 현재 연구실 홈페이지 디자인 (새 `cms-content.js` 포함)
- `cms-content.js` : JSON 데이터를 읽어 News, Publications, Gallery 부분에 표시
- `.pages.yml` : Pages CMS의 관리자 입력 항목 및 미디어 설정
- `data/news.json`, `data/publications.json`, `data/gallery.json` : CMS가 수정할 콘텐츠 데이터
- `media/` : CMS로 업로드한 이미지가 저장되는 폴더
- `.nojekyll` : GitHub Pages가 Jekyll 변환 없이 파일을 제공하도록 하는 파일

## 1. GitHub 저장소
1. https://github.com/ 에서 계정 생성 또는 로그인.
2. Repository를 `본인계정명.github.io`로 생성하고 **Public**으로 설정.
3. ZIP을 로컬에서 **압축 해제**하고 그 안의 파일 및 폴더를 저장소 루트에 업로드. (ZIP 자체를 업로드하면 홈페이지가 작동하지 않습니다.)
   - 브라우저 업로드 시 숨김파일 `.pages.yml`, `.nojekyll`도 누락 없이 포함해야 합니다.
   - 폴더/파일 업로드가 어렵다면 GitHub Desktop으로 저장소 Clone 후 파일을 복사하고 Commit → Push.
4. GitHub Repository > Settings > Pages > Build and deployment > Source: `Deploy from a branch` > Branch `main` / `(root)` > Save.
5. `https://본인계정명.github.io`에서 동작 확인. (업로드 후 배포에 다소 시간이 걸릴 수 있습니다.)

## 2. Pages CMS
1. https://app.pagescms.org/ 에서 GitHub 로그인.
2. Pages CMS GitHub App 설치 요청 시 홈페이지 저장소를 지정. 가능하면 `Only select repositories`로 이 저장소만 선택.
3. 저장소의 `main` 브랜치 선택.
4. `.pages.yml`을 읽으면 `News / 공지사항`, `Publications / 논문`, `Gallery / 사진` 세 메뉴가 나타납니다.
5. 각 메뉴에서 항목을 추가하고 저장. GitHub에 커밋이 기록되고 Pages가 배포됩니다.

## 3. 기존 사진 처리
기존 `data/gallery.json`의 초기 이미지 URL은 원본 Wix CDN에서 가져오도록 되어 있습니다.
최종 이전 전 연구실이 원본을 관리 중인 사진 파일을 확보해 Pages CMS에서 다시 업로드해 주세요.
업로드한 사진은 `media` 폴더에 저장되며, CMS는 `/media/...` 형식의 경로를 JSON에 기록합니다.
새 이미지 갤러리 등록은 제목/날짜/사진/설명을 입력하면 됩니다.

## 4. 도메인 연결
도메인 관리가 허용된 뒤 GitHub Repository > Settings > Pages > Custom domain에 `acsol.hanyang.ac.kr` 입력 > Save.
한양대 도메인 담당자에게 CNAME 등록 요청: `acsol.hanyang.ac.kr` → `본인계정명.github.io`.
**주의:** CNAME 대상에 `/저장소명`이나 `https://`를 넣지 않습니다. 도메인 연결 전에 GitHub Pages 화면에 커스텀 도메인을 먼저 등록하세요.
DNS 반영/인증서 발급 후 `Enforce HTTPS` 선택.

## 5. 중요 참고
- `file://`로 `index.html`을 직접 열면 보안 규정으로 JSON fetch가 막힐 수 있습니다. GitHub Pages 배포 주소 또는 로컬 HTTP 서버에서 테스트하세요.
- GitHub Free의 공개 저장소이므로 비밀번호, 주민번호, 내부 회의록, 비공개 연구자료를 절대 업로드하지 마세요.
- `Pages CMS`는 HTML 디자인 자체를 자동으로 편집하는 도구가 아닙니다. HTML 디자인 변경은 개발자가 해야 합니다.
- 본 스타터에서 동적 관리 가능한 것은 News, Publications, Gallery이며, Research/People 등은 원본 HTML로 유지됩니다.
- 공지와 사진 자료가 많아지면 상세 페이지, 페이지네이션, 정렬 방식 등을 별도 구현해야 합니다.
- CMS 파일 하나의 JSON 배열로 데이터를 관리하므로, 여러 관리자가 **동시에 같은 목록을 수정**할 경우 충돌 여부를 확인하세요.
- 기존 Wix 홈페이지는 완전히 정상 작동하는 것을 검증하기 전까지 유지하세요.

공식 문서:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
https://pagescms.org/docs/quick-start/
https://pagescms.org/docs/configuration/content/list/
