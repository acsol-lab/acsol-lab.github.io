# ACSoL CMS 항목 이름 패치 (v16.1 기반, v16.2 Gallery 패치 사용 안 함)

## 표시 방식 변경
- Research: 연구 분야 제목
- Publications: 논문 제목
- News: 소식 제목
- Gallery: 사진 제목
- Equipment: 장비 이름
- Alumni: 졸업생 이름
- Home 배너: 배너 제목
- 교수님 경력: 재직 기간 · 직책
- 교수님 수상: 수상 시기 · 수상명
- Students: 원래 사용하던 `이름_팀` 그대로 유지
- Research 상세 내용의 하위 블록: 원래 사용하던 블록 제목 그대로 유지

## 반드시 지켜야 할 절차
1. **현재 저장소를 먼저 ZIP으로 백업**하세요. 특히 `data/` 폴더를 보관합니다.
2. 이 ZIP의 `site.js`, `.pages.yml`, `.github/workflows/migrate-cms-item-titles.yml` 및 `tools/`의 파이썬 파일을 GitHub 저장소의 **동일한 위치**에 업로드합니다.
3. GitHub `Settings → Actions → General → Workflow permissions`에서 **Read and write permissions**가 가능한지 확인합니다.
4. `Actions → One-time CMS item titles migration → Run workflow`를 실행합니다.
5. 성공(녹색 체크)이 뜨면 Pages CMS를 새로고침합니다. 이제 각 항목이 제목으로 보입니다.

중요: 2단계 업로드와 4단계 마이그레이션 사이에는 CMS에서 데이터 저장을 하지 마세요. 일시적으로 새 CMS 설정과 옛 JSON 구조가 다릅니다. **홈페이지는 이 기간에도 옛/새 구조 모두 읽도록 작성했습니다.**

## JSON 데이터 변화(콘텐츠는 바뀌지 않음)

이전:
```json
[{"title":"연구실 사진","image":"/media/photo.jpg","featured":true}]
```

변경:
```json
{"items":[{"title":"연구실 사진","image":"/media/photo.jpg","featured":true}]}
```

`data/students.json`은 구조 및 데이터 변경 없음.

기존 배너, News, Publications, Research, 교수님 경력/수상, Alumni, 장비, Gallery의 **모든 필드, 사진 경로, 순서**를 유지합니다. 이미 변환된 파일을 다시 실행해도 중복 변환되지 않습니다.

## 호환성 및 주의 사항
- `site.js`는 `[]` 형태와 `{"items":[]}`를 모두 지원합니다.
- 기존 GitHub Actions 중 Research 팀 자동 동기화·Publications 병합·Under Review 상태 보정이 새 구조도 읽도록 보조 파이썬 파일을 함께 갱신합니다.
- 사용자가 직접 수정한 `site.js`가 있다면 패치 적용 시 해당 변경 내용이 사라질 수 있습니다. 이미 안내받은 `Earlier Alumni` → `Alumni (~2023)` 문구는 패치에 반영했습니다. 그 밖의 직접 편집 사항은 백업과 비교해야 합니다.
- 만약 Actions가 권한 문제로 실패하면, `tools/migrate_cms_item_titles.py`를 저장소 루트에서 Python 3로 직접 실행한 뒤 JSON 변경사항을 GitHub에 commit/push하여 동일한 변환을 할 수 있습니다.
- **절대로 data 폴더 전체를 패키지의 데이터로 덮어쓰지 마세요.** 이번 패치에는 JSON 파일이 포함되어 있지 않습니다.
