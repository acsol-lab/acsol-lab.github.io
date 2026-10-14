# ACSoL 연구실 홈페이지 — 멀티페이지 + Pages CMS (v2)

현재 연구실 HTML 디자인의 남색/파란색 톤을 유지하고, 모든 상단 메뉴를 **독립 HTML 페이지**로 분리한 버전입니다.

## 0. 먼저 읽으세요

- **한양대 도메인 변경과 기존 Wix 페이지 폐쇄는 모든 페이지와 CMS를 검수한 다음에 하세요.**
- 기존 GitHub 저장소가 `nawit-del.github.io`라면 그 저장소의 루트에 이 ZIP의 **압축을 푼 내부 파일**을 업로드합니다.
- GitHub Pages는 `Settings → Pages → Deploy from a branch → main / (root)`로 설정합니다.
- CMS 접속: https://app.pagescms.org/  → GitHub 로그인 → 저장소 선택.
- 이 ZIP에는 실제 연구원 명단 및 연구실 원본 사진이 **들어 있지 않습니다**. 본인 사진을 업로드해야 표시됩니다.
- 제공한 기존 HTML에서 사용하는 **Wix 이미지 URL은 모두 제거**했습니다. 메인 및 교수님, 연구 분야 사진은 CMS에서 업로드하기 전에는 자리표시자가 보입니다.
- News/Publication은 기존 예제 데이터를 유지했습니다. 실제 공개 전에 내용·DOI를 검수하세요.

## 1. 홈페이지 구조

```
index.html              # Home : 짧은 소개, 대표 사진, 4개 연구 분야 요약
research.html           # Research : CMS로 사진·제목·설명 추가
people.html             # People : 교수님 / 박사과정 / 석사과정 / Alumni
publications.html       # Publications : CMS 논문 목록
news.html               # News : CMS 공지사항
 gallery.html            # Gallery : CMS 사진
contact.html            # Contact : 연구실 연락처
styles.css              # 전체 페이지 공통 디자인
site.js                 # 모든 페이지 CMS 데이터 표시
.pages.yml              # CMS 메뉴 및 입력 필드 설정
.nojekyll               # GitHub Pages Jekyll 처리 방지
data/site.json          # 메인 대표 사진, 소개문구, 교수 사진 및 연락처
 data/research.json      # 연구 분야 4개. CMS에서 순서·내용·사진 변경
 data/students.json      # 재학생. 기본 [] ; 박사/석사 과정으로 자동 분류
 data/alumni.json        # 졸업생. 기본 [] ; 이름 + 직장
 data/news.json          # 뉴스 데이터
 data/publications.json  # 논문 데이터
 data/gallery.json       # 갤러리. 기본 []
media/.gitkeep          # CMS 사진이 들어갈 폴더 (점으로 시작하는 파일)
```

## 2. GitHub 저장소 업데이트 (현재 사용 중인 저장소)

1. 기존 홈페이지가 잘 동작 중이라면 저장소를 백업(예: ZIP 다운로드)하는 것이 좋습니다.
2. 새로운 ZIP을 컴퓨터에 압축 해제합니다.
3. GitHub 저장소 `nawit-del.github.io`에서 `Add file → Upload files`를 선택하고 파일들을 루트에 업로드하세요. 동일 파일은 새 버전으로 덮어씁니다.
4. 웹 업로드에서 **숨김 파일** `.pages.yml` 또는 `.nojekyll` 업로드가 차단되면 GitHub 저장소에서 `Add file → Create new file` 기능으로 직접 만드세요. `.pages.yml`은 이 ZIP에 있는 **전체 내용**을 복사합니다.
5. `media/` 폴더는 빈 폴더면 저장되지 않습니다. `Add file → Create new file`에서 `media/.gitkeep`을 만들어 놓거나 Pages CMS에서 처음 사진을 올리면 자동으로 생깁니다.
6. `.pages.yml`, `site.js`, `styles.css`, `data/` 내부 JSON과 각각의 `.html` 파일이 GitHub 루트에 있는지 확인합니다.
7. GitHub Pages가 배포한 뒤 `https://nawit-del.github.io`에서 상단 메뉴 링크를 눌러 다른 페이지로 이동하는지 확인합니다.

> **중요:** `data` 폴더가 누락되면 각 페이지의 동적 콘텐츠가 표시되지 않습니다. 이 홈페이지는 `file://`로 HTML을 더블클릭하면 브라우저의 JSON fetch 제한으로 정상 작동하지 않을 수 있습니다. 반드시 https://nawit-del.github.io 혹은 로컬 HTTP 서버에서 테스트하세요.

## 3. CMS에서 메인 사진 바꾸기

1. https://app.pagescms.org/ → `nawit-del.github.io` 저장소를 엽니다.
2. `Home / 교수님 / 연락처`를 엽니다.
3. `메인 대표 사진 업로드`에 컴퓨터에 있는 JPG/PNG/WebP 파일을 업로드하거나 미디어 라이브러리에서 선택합니다.
4. 저장하면 `media/`에 파일이 추가되고 `data/site.json`의 `heroImage`가 `/media/...`로 바뀝니다.
5. 배포 후 메인에서 업로드 사진이 나타납니다.

같은 메뉴의 `교수님 사진 업로드`는 People 페이지 상단 교수님 사진을 수정합니다.

## 4. CMS에서 연구 분야와 사진 관리

- `Research / 연구 분야와 사진` 메뉴를 열어 네 개 연구 주제를 각각 수정합니다.
- 제목(`title`), 소제목(`subtitle`), 설명(`description`), 키워드(`keywords`), 사진(`image`)을 업로드하고 저장합니다.
- **Home에는 네 개 연구 분야의 짧은 요약만** 나오고, **Research 페이지에는 사진과 상세 설명**이 나옵니다.
- CMS에서 항목을 새로 만들거나 삭제하면 Research 페이지 목록도 함께 갱신됩니다. Home은 처음 4개 항목만 보여줍니다.

## 5. CMS에서 학생 등록 / 과정 자동 분류

- `People / 박사·석사 재학생` 메뉴를 선택한 뒤 항목을 추가합니다.
- `과정 선택`에서 `박사과정` 또는 `석사과정`을 선택합니다. **필수 항목**입니다.
- 이름, 기수(예: `2` 또는 `2기`), 연구 분야, 사진을 입력하고 저장합니다.
- 웹사이트는 과정 값(`phd` / `master`)에 따라 Ph.D. Students 또는 M.S. Students 목록에 **자동 분류**합니다.
- 사람이 졸업했다면 재학생 목록에서 해당 학생을 삭제하고 Alumni 항목에 이름과 직장을 따로 등록하는 방식을 추천합니다.

## 6. Alumni 등록

- `People / Alumni 졸업생`에서 새 행에 `이름`, `현 직장 또는 소속`만 입력하고 저장합니다.
- Alumni에는 사진이 표시되지 않으며 두 개의 열로 구성된 표가 나타납니다.

## 7. 연구실 사진을 직접 업로드하는 두 방법

**A. Pages CMS에서 업로드 (가장 간단)**

1. CMS에서 `Home / 교수님 / 연락처`, `Research`, `People`, `Gallery` 중 업로드할 위치를 엽니다.
2. 해당 사진 필드에서 Upload 또는 이미지 선택을 누릅니다.
3. 컴퓨터에 있는 JPG / PNG / WebP 이미지를 선택합니다.
4. Save 후 GitHub 저장소 `media/`에 실제 파일이 생성됩니다.
5. 파일 주소가 JSON 데이터에 자동 기입되므로 HTML을 직접 수정할 필요가 없습니다.

**B. GitHub에 직접 업로드 (대량 사진에 편리)**

1. GitHub 저장소에서 `media` 폴더를 엽니다 → `Add file → Upload files`.
2. 컴퓨터의 사진 파일을 업로드하고 Commit합니다.
3. CMS의 사진 입력란에서 업로드된 미디어를 선택하고 Save합니다.
4. GitHub 파일 주소를 직접 입력해야 한다면 `/media/my-photo.jpg` 형태를 사용합니다. 이 홈페이지의 JS는 `media/` 경로만 이미지로 허용합니다.

**권장:** 브라우저 표시용 사진은 긴 변 기준 1600~2000px 내외로 조정하여 JPG/WebP로 저장하세요. 한 장당 0.2~1.5 MB 정도를 권장합니다(품질과 사진 종류에 따라 달라집니다). GitHub 개별 파일 업로드 제한, 저장소 크기와 트래픽 정책을 고려해야 합니다. 대용량 원본 사진은 별도 보관이 좋습니다.

## 8. 예시 사진 미포함 및 보안

- 현재 사이트 사진은 비워 두었기 때문에 CMS에 사진을 올리기 전까지 `Photo will be added from Pages CMS` 같은 자리표시자가 나옵니다. **웹사이트가 고장난 것이 아닙니다.**
- 사진 파일에 개인정보·민감한 메타데이터가 포함되어 있는지 확인하세요.
- GitHub Pages가 사용하는 **공개 저장소에 모든 이미지 및 JSON 정보가 공개**됩니다. 내부 자료/연락처/비공개 학생 정보를 업로드하지 마세요.
- 공개 학생 프로필과 사진은 당사자에게 게시 동의를 받는 편이 안전합니다.

## 9. 동작 확인

- [ ] 메인 화면에는 연구실 간단 소개만 표시되는가?
- [ ] Research 메뉴를 클릭하면 `research.html`로 이동하는가?
- [ ] People 메뉴를 클릭하면 `people.html`로 이동하는가?
- [ ] People에서 박사/석사/Alumni 그룹이 나타나는가?
- [ ] CMS에서 학생을 추가한 뒤 올바른 그룹에 나타나는가?
- [ ] CMS에서 메인 대표 사진을 바꿨을 때 반영되는가?
- [ ] Research의 사진을 바꾸면 Research 페이지에 반영되는가?
- [ ] News / Publications / Gallery 모두 CMS 내용과 연결되는가?
- [ ] 모바일 메뉴가 정상 작동하는가?

## 10. 학교 도메인 변경

사이트를 모두 검수하기 전에는 **기존 Wix와 한양대 DNS 연결을 유지하세요.**
완성 후 GitHub `Settings → Pages → Custom domain`에 `acsol.hanyang.ac.kr`을 등록하고, 한양대 담당자에게 현재 DNS 등록 상태를 확인한 다음 CNAME 대상으로 `nawit-del.github.io`를 요청하면 됩니다. GitHub Pages에서 `Enforce HTTPS`를 설정하세요.

공식 문서:
- https://pagescms.org/docs/configuration/content/list/
- https://pagescms.org/docs/configuration/media/
- https://pagescms.org/docs/configuration/fields/select/
- https://docs.github.com/en/pages/
