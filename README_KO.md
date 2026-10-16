# ACSoL v16.1 — News 대표 사진을 Home·News 목록에 표시

이 패치는 기존 v16.1에 적용한 **이후의 Students/Alumni/CMS/Media Organizer 변경사항을 보존하기 위해 현재 GitHub 파일을 직접 수정**합니다.

## 무엇이 변경되나요?

- **Pages CMS → News → 공지사항**에서 이전의 `상세 내용 사진 (선택)` 필드가 **`뉴스 대표 사진 (Home·News 목록에 표시, 선택)`**으로 표시됩니다.
- 저장 키는 그대로 **`detailImage`**입니다. 이전에 등록한 사진도 재업로드할 필요가 없습니다.
- Home 소식 카드: 사진이 있는 경우 사진 왼쪽 + 제목·요약 오른쪽. 사진이 없으면 기존 텍스트 카드 유지.
- News 페이지: 사진이 있는 경우 날짜 / 대표사진 / 제목·요약. 사진이 없으면 기존 텍스트 행 유지.
- 사진은 `object-fit:contain`과 자동 비율로 **어느 부분도 자르지 않습니다**. 극단적으로 세로로 긴 사진만 카드가 과도하게 커지지 않게 최대 표시 높이를 제한하면서도 전체가 보이도록 축소합니다.
- 펼쳐지는 세부 내용에서는 대표 이미지를 다시 표시하지 않아 **사진 중복이 없습니다**. 상세 글은 그대로 유지됩니다. 사진만 있고 추가 상세 글이 없으면 불필요한 펼침 버튼을 숨깁니다.
- 기존 `data/news.json`과 모든 이미지 파일은 **절대 변경하지 않습니다**.

## GitHub에 적용하기 — 파일을 덮어쓰지 않는 안전 방식

1. 현재 `nawit-del.github.io` 저장소를 ZIP으로 **백업**합니다.
2. 압축파일에서 다음 **새 파일 3개만** 기존 경로에 업로드합니다.
   - `news-main-images.css` (저장소 최상위)
   - `tools/update_news_main_photos.py` (tools 폴더)
   - `.github/workflows/acsol-news-main-photos.yml` (.github/workflows 폴더)
3. GitHub → `Actions` → **One-time News cover photos (keep CMS data)** 를 엽니다.
4. `Run workflow`에서 `run_mode=plan`으로 실행합니다. `Preview or apply the News photo patch` 로그에 `Will edit: site.js, .pages.yml, index.html, news.html`이라고 표시되면 정상입니다. (`plan`은 아무것도 수정하지 않습니다.)
5. 같은 Action을 `run_mode=apply`로 실행합니다. JavaScript 문법을 검사하고 4개 파일을 수정하여 커밋합니다.
6. GitHub Pages 배포 성공을 기다린 뒤 Home / News를 새로고침하고, Pages CMS → News 메뉴에 **뉴스 대표 사진** 필드가 표시되는지 확인합니다.

**중요:** GitHub Actions에서 해당 저장소를 수정할 권한이 필요합니다. Settings → Actions → General → Workflow permissions → Read and write permissions로 확인합니다. 조직 정책에 따라 수정할 수 없을 수 있습니다.

`apply` 후 `Commit updated News files`가 성공하였지만 GitHub Pages 화면이 바뀌지 않으면 배포 상태 및 브라우저 캐시를 확인하세요. 빌드가 자동 발생하지 않는 경우 별도 정상 배포 커밋이 필요할 수 있습니다.

## CMS 사용 방법

- 기존 `detailImage`의 이미지가 있다면 **그대로** 사용됩니다.
- 새로운 News에서는 CMS의 `뉴스 대표 사진 (Home·News 목록에 표시, 선택)` 필드에 JPG/PNG/WebP를 업로드하면 됩니다.
- 사진이 없는 News는 해당 필드를 비워 두면 됩니다. 사진 자리는 만들어지지 않습니다.
- `펼침 상세 내용`에는 자세한 문구를 입력할 수 있으며, 기존처럼 우측 V자 버튼으로 열 수 있습니다.
- 기존 Media Organizer가 있다면 `detailImage` 파일의 위치와 명명 규칙을 변경하지 않으므로 충돌하지 않습니다.

## 기존 구조 보존

이 패치는 `site.js` 안에서 News를 그리는 부분만 수정합니다. `.pages.yml`에서는 News 사진 입력란의 **표시 이름만** 바꿉니다. `data/news.json`, `data/gallery.json` 등 데이터 파일과 `styles.css`를 덮어쓰지 않습니다. 따라서 앞서 적용한 Research 이미지 비율 및 Students 사진 보정도 그대로 유지됩니다.

만약 현재 파일 구조가 많이 수정되어 대상 코드가 다르면 스크립트가 **오류로 중단하고 일부 파일을 덮어쓰지 않습니다**. 이 경우 현재 `site.js`를 보내주시면 해당 버전에 맞춰 조정할 수 있습니다.

### 구성 파일

- `news-main-images.css`: 새 화면 레이아웃
- `tools/update_news_main_photos.py`: 현재 `site.js`, `.pages.yml`, `index.html`, `news.html`을 안전하게 수정하는 스크립트
- `.github/workflows/acsol-news-main-photos.yml`: plan/apply 실행 액션
