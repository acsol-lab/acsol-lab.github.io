# ACSoL v16.1 — 모집 배너 이미지 크기 CMS 업데이트

## 신규 CMS 설정

Pages CMS → Home → 기간 지정 모집·안내 배너 → 배너 항목에서:

- **이미지 크기 강제 지정**: `사용 안함`(기존 디자인) 또는 `사용`
- **가로 넓이 (px)**: 예 `948.6`
- **세로 높이 (px)**: 예 `575.2`
- **사진 맞춤 방식**: `전체 표시(비율 유지)` / `박스 채움(일부 잘릴 수 있음)` / `정확히 맞춤(비율 왜곡 가능)`

강제 지정을 활성화하고 가로·세로에 양수를 넣으면 요청한 표시 크기를 적용합니다. **작은 화면에서는 가로와 세로를 같은 비율로 축소**하여 화면 밖으로 벗어나지 않도록 합니다. 입력 크기는 이미지 파일 자체의 해상도를 바꾸지 않고 브라우저의 표시 크기만 조절합니다.

## 설치

1. 기존 GitHub Organization의 홈페이지 저장소를 백업하세요.
2. ZIP에서 다음 3개의 새 파일을 **원래 경로대로** 업로드하세요.
   - `banner-image-sizing.css` (저장소 최상위)
   - `tools/patch_banner_sizing.py`
   - `.github/workflows/acsol-banner-sizing.yml`
3. GitHub → Actions → **One-time ACSoL banner image sizing**에서 `Run workflow`를 실행합니다.
4. `run_mode = plan`을 실행해 변경 내용을 로그에서 확인합니다. (파일 변경 없음)
5. 문제가 없으면 같은 Action의 `run_mode = apply`로 다시 실행합니다.
6. Actions 결과에서 `Commit updated files` 성공을 확인하고 Pages CMS를 새로고침합니다.
7. 홈페이지 배포 상태를 확인합니다. `GITHUB_TOKEN`으로 생성된 커밋은 **GitHub Pages 재배포를 자동 유발하지 않을 수 있으므로**, Pages가 재배포되지 않았다면 README 등에 간단한 변경을 직접 커밋해 배포를 촉발하세요.

## 기존 기능 보존

`data/banners.json`, `data/students.json`, `data/news.json`, 사진 파일은 건드리지 않습니다. 실제 GitHub 저장소의 최신 `.pages.yml`, `site.js`, `index.html`을 부분 수정합니다. 기존 배너 노출 기간·오늘 하루 보지 않기·드래그 기능을 유지합니다.

## 주의 사항

- `plan`에서 오류가 발생했다면, **apply 실행을 중지**하고 현재 저장소의 `.pages.yml` 또는 `site.js`를 확인해야 합니다.
- `imageWidth`/`imageHeight`가 0이거나 비어 있으면 기존 자동 크기로 표시됩니다.
- 모바일 등 화면이 작은 곳에서는 강제 지정한 크기가 넘치지 않도록 **축소됩니다**.
- `contain`: 이미지 전체가 보이지만 여백이 생길 수 있음 (권장).
- `cover`: 박스를 채우지만 일부가 잘릴 수 있음.
- `fill`: 정확한 박스에 맞추나 이미지가 늘어나거나 찌그러질 수 있음.
