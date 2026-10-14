# ACSoL GitHub Pages + Pages CMS v4 — 업데이트 안내

## 0. 무엇이 바뀌었나요?

- `Home / 메인 화면 설정`: `data/home.json`을 별도로 관리합니다.
- `People / 교수님 프로필`: `data/professor.json`을 별도로 관리합니다.
- 교수님 상단 문구, 영문/한글 이름, 프로필 사진, 직책/첫 줄, 학과/둘째 줄, 추가 직책/셋째 줄, 학교/넷째 줄, 사무실, 이메일, 전화번호, 소개, 한글 호칭 및 연락처 표시명을 모두 CMS에서 수정할 수 있습니다.
- 이전과 같이 `People / 교수님 경력 및 직책`, `People / 교수님 수상 경력`은 **독립 목록**입니다.
- 경력·수상 로딩이 실패하면 10초 이내에 명시적인 오류 안내를 보여주며 오류 파일명은 브라우저 개발자 도구 Console에서 볼 수 있습니다.
- `site.js?v=4`와 `styles.css?v=4`를 사용해 브라우저가 구버전 JavaScript를 재사용하는 문제를 줄입니다.

## 1. **기존 데이터 보호**: 가장 먼저 저장소 백업

1. GitHub 저장소 `nawit-del.github.io`에서 Code → Download ZIP으로 전체 백업을 받으세요.
2. 기존 `data/site.json`, `data/students.json`, `data/alumni.json`, `data/research.json`, `data/news.json`, `data/publications.json`, `data/gallery.json`, `data/professor-employment.json`, `data/professor-awards.json`, `media/` 폴더를 삭제하거나 덮어쓰지 마세요.
3. 사용자가 CMS에서 이미 수정한 내용을 보호하려면 **v3→v4 업데이트 전용 ZIP**을 사용하세요.

## 2. v3에서 v4로 적용하기

업데이트 전용 ZIP에는 다음 파일만 포함되어 있습니다.

```
.pages.yml           # Pages CMS 관리자 메뉴 분리
site.js              # 독립 데이터 파일 로딩 및 오류 표시 수정
index.html           # 캐시 무효화
research.html        # 캐시 무효화
people.html          # 새 프로필 필드 및 캐시 무효화
publications.html
news.html
gallery.html
contact.html
data/home.json        # 신규 (현재 공개 저장소의 10/14 기준 Home 값 반영)
data/professor.json   # 신규 (현재 공개 저장소의 10/14 기준 교수님 정보 반영)
```

이전 버전의 JSON 파일들은 업데이트 패키지에 없으므로 기존 데이터가 보호됩니다.

**중요:** `data/home.json`과 `data/professor.json`의 기본값은 2026-10-14에 공개된 `data/site.json` 정보를 참고했습니다. 그 이후 기존 사이트에서 사진·문구·연락처를 수정했다면 새 CMS에 들어가 값이 최신인지 확인하세요.

- 압축파일의 **내부 내용**을 GitHub 저장소 최상단에 업로드합니다.
- `.pages.yml`이 `This file is hidden`으로 업로드되지 않으면 기존 GitHub `.pages.yml`을 편집해 새 내용을 붙여 넣고 Commit합니다.
- `data/home.json`과 `data/professor.json`은 각각 `data/` 폴더에 들어가야 합니다. 루트 폴더에 올리면 안 됩니다.
- GitHub Actions/Pages 배포가 끝나면 `https://nawit-del.github.io/people.html`을 새로고침(Ctrl+F5)합니다.
- Pages CMS 관리자 화면을 새로고침하면 `Home / 메인 화면 설정`, `People / 교수님 프로필`이 각각 표시됩니다.

## 3. 경력·수상 '불러오는 중'이 계속 표시된다면

먼저 GitHub 저장소 아래 URL에서 실제 JSON 내용이 나오는지 확인합니다.

- `https://nawit-del.github.io/data/professor-employment.json`
- `https://nawit-del.github.io/data/professor-awards.json`

두 JSON은 GitHub의 `main` 브랜치에 존재하는 것으로 확인되지만, 실제 GitHub Pages 배포본이나 브라우저 캐시 상태가 동일하다고 보장되지는 않습니다.

**`F12 → Network → Fetch/XHR`** 에서 다음을 확인하세요.
- 200 : JSON 다운로드는 정상; `F12 → Console`에서 JSON 파싱 오류나 JavaScript 오류 확인
- 404 : 파일이 잘못된 폴더에 있거나 GitHub Pages 배포에 아직 반영되지 않음
- 403 : 권한/접근 관련 문제
- Pending / Canceled / timeout : 네트워크, 확장 프로그램 또는 연결 문제

페이지를 로컬에서 더블클릭해 `file://`로 열면 JSON fetch가 정상 작동하지 않을 수 있습니다. GitHub Pages 주소에서 확인하세요.

## 4. 교수님 정보와 Home 정보 관리

- **Home / 메인 화면 설정** → `data/home.json` : 대표 사진, 메인 큰 문구, 소개 내용
- **People / 교수님 프로필** → `data/professor.json` : 이름, 호칭, 직책 4줄, 추가 직책, 프로필 사진, 위치, 이메일, 전화번호, 소개, 연락처 정보
- **People / 교수님 경력 및 직책** → `data/professor-employment.json` : 목록 수정
- **People / 교수님 수상 경력** → `data/professor-awards.json` : 목록 수정

현재 교수님 직책·소속 4줄은 개별 필드이므로 필드 단위로 수정할 수 있습니다. 입력 칸을 비우면 해당 줄을 표시하지 않습니다.

이전 `data/site.json`은 삭제하지 마세요. 신버전의 `home.json` 혹은 `professor.json`이 누락된 경우 기존 내용을 표시하는 호환용으로 사용됩니다. 구버전 파일이 남아 있어도 CMS 편집은 분리된 새 파일에만 저장됩니다.

## 5. 사진 등 기존 CMS 기능

- 기존 학생, Alumni, Research, News, Publications, Gallery의 데이터와 관리 기능은 변경하지 않았습니다.
- Home 대표 사진/교수님 사진을 Pages CMS에서 바꾸면 `media/` 폴더에 저장됩니다.
- 경력이나 수상 기록은 개별 항목을 추가/삭제할 수 있습니다.
- GitHub 저장소가 공개라서 CMS에 입력된 개인정보·사진도 공개됩니다. 공개 전 검수 및 동의를 권장합니다.

## 6. 장애 분석 / 버전 확인

- 브라우저 주소가 `https://nawit-del.github.io/people.html`인지 확인
- `F12 → Network`에 `site.js?v=4`가 표시되는지 확인 (옛날 `site.js`만 보이면 HTML 업데이트 누락 또는 캐시)
- `data/professor-employment.json` 및 `data/professor-awards.json` 응답 상태 확인
- GitHub Pages `Settings → Pages` 및 Actions 배포 완료 여부 확인
