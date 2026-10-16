# ACSoL v16.1 — Research 상세 이미지 원본 비율 유지

## 변경 내용

- Research 상세 페이지 상단 대표 이미지와 추가 상세 이미지에 적용된 고정 높이 및 최대 높이 제한을 해제합니다.
- 모든 연구 상세 페이지에서 사진의 가로 너비는 페이지 콘텐츠 영역의 100%(최대 1080 CSS px)로 동일합니다.
- 각 이미지의 세로 높이는 원본 가로세로비에 따라 자연스럽게 결정됩니다.
- 사진을 자르거나 강제로 늘리지 않습니다.
- Research 요약 목록의 썸네일 이미지는 현재 카드 디자인을 유지합니다.

## GitHub 적용

1. `research-image-natural.css` 파일을 저장소 최상위 폴더에 **추가**합니다.
2. `research-detail.html` 파일을 같은 위치에서 **교체**합니다.
3. 기존 `styles.css`, `site.js`, `.pages.yml`, `data/`, `media/` 파일은 건드리지 않습니다.
4. 배포 후 `research-detail.html?topic=1`부터 각 연구 상세 페이지를 확인합니다.

### 최근에 research-detail.html을 직접 수정했다면

수정한 파일을 덮어쓰는 대신, 기존 `research-detail.html`의 `<head>` 안에 다음 한 줄을 **기존 styles.css 링크 뒤에** 추가하세요.

```html
<link href="research-image-natural.css?v=16.1-research-fit-1" rel="stylesheet"/>
```

이렇게 하면 원본 HTML의 다른 변경사항을 유지할 수 있습니다.

## 주의

세로로 긴 이미지는 가로 100%로 표시될 때 길게 보일 수 있습니다. 이는 전체 이미지를 자르지 않고 표시하기 위한 의도한 동작입니다.
기존에 올린 이미지와 CMS 데이터 구조는 변경되지 않습니다.
