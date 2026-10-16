# ACSoL v16.1 — Research 흰색 배경 + 미디어 자동 정리

**이 패치는 기존 사이트의 `styles.css`, `site.js`, `.pages.yml`, `data/`, `media/`를 통째로 덮어쓰지 않습니다.**

## 변경사항

1. `research-detail-white.css`: Research 상세화면 대표사진/추가사진의 배경을 **흰색**으로 통일. 기존 원본 비율 유지 CSS는 보존합니다.
2. `tools/configure_cms_media.py`: 현재 `.pages.yml`에 이미지 업로드 경로만 추가하고 `research-detail.html`에 CSS 링크 한 줄을 덧붙입니다. **기존 CMS 메뉴·설정은 유지됩니다.**
3. `tools/organize_media.py`: CMS 사진 URL을 찾아 `media/student`, `media/research`, `media/gallery`, `media/banner`, `media/news`, `media/alumni`, `media/professor`, `media/equipment`, `media/home`으로 분류합니다. 이름·사진 유형·원래 확장자를 이용하여 파일명 지정.
4. GitHub Actions: 설정은 일회성 수동, 사진 정리는 자동(push) 및 수동 실행 지원.

### 예시

| 입력 데이터 | 정리된 파일명 |
| --- | --- |
| Students 이름 = 한민종, 증명사진 | `media/student/한민종_증명사진.jpg` |
| Students 이름 = 한민종, 일상사진 | `media/student/한민종_일상사진.png` |
| Research 이름 = Emerging Memory, 요약 이미지 | `media/research/Emerging_Memory_요약사진.webp` |
| Research 이름 = Emerging Memory, 세부 대표 이미지 | `media/research/Emerging_Memory_세부대표사진.png` |
| Gallery 제목 = 2026 연구실 회식 | `media/gallery/2026_연구실_회식_갤러리사진.jpg` |

`summaryImage`/`detailImage`가 없는 구버전 Research는 기존 `image` 필드를 대표사진으로 분류합니다.

## 설치 순서 (중요)

1. **먼저 GitHub 저장소 전체를 ZIP으로 백업**합니다. `data/`와 `media/`의 현 상태도 보관합니다.
2. 이 패치 ZIP을 압축 해제하여 **다음 새 파일만** 저장소에 업로드합니다.
   - `research-detail-white.css`
   - `tools/configure_cms_media.py`
   - `tools/organize_media.py`
   - `.github/workflows/configure-cms-media-folders.yml`
   - `.github/workflows/organize-acsol-media.yml`
3. **기존 `.pages.yml`, `research-detail.html`, `data`, `media`는 직접 덮어쓰지 마세요.**
4. 저장소 `Settings → Actions → General → Workflow permissions → Read and write permissions`를 허용합니다(조직 정책 허용 시).
5. `Actions → Configure CMS media folders (one-time) → Run workflow`를 **한 번** 실행합니다. 이 Action이 현재 `.pages.yml`을 읽고 각 이미지 필드에 기본 폴더 경로를 추가합니다. 또한 Research 흰 배경 CSS 링크를 삽입합니다.
6. `Actions → Organize ACSoL images → Run workflow`에서 `run_mode=plan`을 선택해 이동 예정 파일명을 로그에서 검토합니다.
7. 같은 Workflow에서 `run_mode=apply`를 실행합니다. 새 경로로 **복사**, JSON 경로 변경, 기록 파일 생성이 진행됩니다. 기존 원본 파일은 그대로 보존합니다.
8. **CMS에서 사진 한 장을 테스트 업로드하여 저장**한 뒤 새 `media/` 분류 경로와 GitHub Action 실행 결과를 확인합니다. 이름이 지정되고 JSON 경로도 변경되면 성공입니다.
9. GitHub Pages 사이트에서 사진 정상 출력을 확인하고, `Ctrl + F5`를 누릅니다. GitHub Actions의 `GITHUB_TOKEN`이 작성한 커밋은 **자동으로 새 Pages 빌드를 발생시키지 않을 수 있습니다.** 결과 반영이 지연되면 CMS의 다른 내용을 한 번 저장하거나 사람이 직접 빈 커밋을 하는 등 **새 Pages 배포를 유발하는 정상 커밋**을 생성하세요.
10. 안정적으로 운영되는 것을 확인한 뒤에만 선택적으로 `run_mode=cleanup` + `confirm_cleanup=true`를 실행할 수 있습니다. **기존 파일 삭제는 필수가 아니므로 처음에는 실행하지 않는 것을 권장합니다.**

## 자동화 동작 방식

- Pages CMS가 새 이미지를 업로드하면 이미지 필드에 따라 `media/student`, `media/research` 등으로 들어갑니다(필드 업로드 기준).
- CMS에서 학생 이름과 사진을 포함한 항목을 **저장하면**, GitHub 저장소의 `data/*.json` 변경으로 Action이 실행됩니다.
- Action은 현재 JSON의 이름과 필드 구분을 읽어 파일을 `한민종_증명사진.jpg` 등으로 복사하고, `data/students.json` 속 경로를 변경합니다.
- 파일명이 동일하더라도 **바이트 내용이 다른 파일은 덮어쓰지 않고 고유 접미사**를 붙입니다. 기존 원본은 유지하여 배포 지연 중 404를 방지합니다.
- 재실행해도 파일명이 계속 바뀌지 않도록 설계했습니다.
- CMS의 **미디어 보관함에서 파일만 업로드하고 데이터 항목에 연결하지 않은 이미지**는 누구의 사진인지 알 수 없으므로 이름을 자동 추론할 수 없습니다. 학생/Research CMS 입력 화면에서 이미지를 등록하고 해당 항목을 저장하세요.
- 일부 오래된 JSON이나 이미지의 경로가 유효하지 않으면 자동으로 추측하거나 삭제하지 않고 로그에 경고를 남깁니다.

## 주의

- 홈페이지는 정적 GitHub Pages입니다. **작업이 진행되는 동안 CMS로 같은 항목을 동시 편집하지 않는 것이 안전합니다.**
- 자동 Action이 저장한 커밋은 기존 파일 보존을 우선합니다. 파일명 복사본으로 사용량이 증가하므로, 백업과 페이지 검증 후 원본 정리 Workflow를 선택적으로 사용하세요.
- `data` 폴더의 JSON은 `[]`, `{ "items": [...] }` 및 `{ "students": [...] }` 구조를 지원합니다. 내용이 없는 0바이트 JSON은 건너뜁니다.
- Pages CMS 버전에 따라 이미지 업로드 폴더 기본 표시 UI가 다를 수 있습니다. 설정 후 **실제 한 장 업로드**로 확인하십시오.
- 이미지 내부에 실제로 칠해진 하늘색 픽셀은 CSS로 흰색 변경이 되지 않습니다. 이번 변경은 이미지 요소의 **배경색**을 흰색으로 지정하는 것입니다.

## 직접 CSS만 적용하고 싶을 경우

`research-detail.html`에서 기존 `styles.css` 및 `research-image-natural.css`의 `<link>` 아래에 다음 한 줄을 추가합니다.

```html
<link rel="stylesheet" href="research-detail-white.css?v=16.1-media-1">
```

CSS 파일 내용은 ZIP의 `research-detail-white.css`에 있습니다.
