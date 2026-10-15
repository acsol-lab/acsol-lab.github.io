# ACSoL v15.1 — Students 및 News 교체 방식

이번 업데이트에서는 v15과 달리 News를 병합하지 않습니다.
- `data/students.json`: Wix 재학생 명단으로 교체 (v15과 동일)
- `data/news.json`: Wix Home 2026 + Wix News에서 가져온 소식 **121건으로 전체 교체**
- Publications / Research / Gallery / Professor 등 그 밖의 `data/*.json` 및 `media/`는 **그대로 유지**

## GitHub 적용 — v14에서 직접 v15.1로
1. 반드시 현재 `data/news.json`과 `data/students.json`을 다운로드하여 백업하세요.
2. 이 ZIP을 압축 해제하고 기존 저장소의 최상위(root)에 업로드하세요. 같은 이름의 파일은 교체합니다.
3. `.pages.yml`을 포함해 보이는 모든 파일을 업로드하세요. 점으로 시작하는 파일은 GitHub 웹 편집기나 GitHub Desktop 사용을 권장합니다.
4. `data/news.json`에 121건이 들어 있는지 확인하세요. 날짜가 연도 또는 연·월까지만 표기된 항목은 원문 그대로 유지했습니다.
5. Commit 후 GitHub Actions의 Pages 배포가 완료됐는지 확인하고 홈페이지 및 Pages CMS를 새로고침하세요.
6. **News 병합용 Actions는 실행하지 마세요.** 이 ZIP에는 병합 워크플로가 포함돼 있지 않습니다.

## 이미 기존 v15를 올린 경우
- 별도 제공한 `ACSoL_v15_1_News_Overwrite_Only.zip` 내부 `data/news.json`만 업로드하면 됩니다.
- 기존 저장소에 `.github/workflows/import-wix-news.yml`이 남아 있다면 선택적으로 삭제해도 됩니다.
- `data/news-wix-import.json`와 `tools/merge_news.py`도 이제 불필요하므로 삭제해도 됩니다.
- **주의:** 파일을 덮어쓰면 현재 `data/news.json`의 수동 추가·수정 내용은 사라집니다.

## CMS
Pages CMS > 콘텐츠 관리 > News > 공지사항 메뉴 하나에서 `data/news.json`을 관리합니다.
별도의 'Wix News' CMS 관리 메뉴는 필요하지 않습니다.
