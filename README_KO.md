# ACSoL v10 — GitHub Pages + Pages CMS

기준: v9 → v10. 기존 디자인, Gallery 즐겨찾기 자동 슬라이드, 논문 정렬, 학생·교수님·Alumni·장비 데이터는 유지합니다.

## 업데이트

1. `nawit-del.github.io` 저장소에서 먼저 **Code → Download ZIP**으로 백업하세요.
2. **v9_to_v10_Update_Only.zip**을 압축 해제하여 `.html`, `site.js`, `styles.css`, `.pages.yml`을 같은 이름으로 교체하고 `data/page-*.json`(새 파일 11개)과 `data/typography.json`을 추가합니다. `Commit changes` 합니다.
3. **기존 `data/home.json`, `data/research.json`, `data/publications.json`, `data/news.json`, `data/students.json`, `data/gallery.json`, `media/` 등을 삭제하거나 덮어쓰지 마세요.** 업데이트용 ZIP에는 기존 콘텐츠 JSON이 없습니다.
4. `.pages.yml`은 숨김 파일이므로 GitHub 웹에서 직접 열고 Edit(연필)로 새 전체 내용을 붙여넣어 교체하거나 GitHub Desktop을 이용하세요.
5. `Settings → Pages`에서 main / root 설정과 Actions 배포 상태를 확인하고 새로고침하세요.
6. Pages CMS(`https://app.pagescms.org`)를 새로고침하여 페이지별 관리 메뉴가 나타나는지 확인하세요.

## 이번 버전 주요 개선

- **Research / People**: PC에서는 Hover 및 키보드 Focus로 각 하위 메뉴가 열립니다. Research 글자 클릭 → 전체 연구분야, People 글자 클릭 → 교수님 페이지. Research 드롭다운에 'All Research'와 01~04 숫자를 제거했습니다. 터치·모바일에서는 글자 링크 옆 펼침 버튼을 눌러 하위 메뉴를 열 수 있습니다.
- **Equipment 하이라이트**: Equipment 페이지는 Equipment만 현재 메뉴(aria-current)로 표시하도록 수정했습니다.
- **페이지 제목**: 예시인 `Ideas, in publication.`이 PC에서 한 줄에 보이도록 수정했습니다. 과도하게 긴 맞춤형 제목이나 작은 모바일 화면에서는 가로 넘침을 피하기 위해 줄바꿈될 수 있습니다.
- **버튼**: Explore our research / Send an email을 사각 테두리 없이 밑줄 텍스트 + 작은 화살표로 변경했습니다.
- **News**: 상세 펼침/접힘은 우측의 작은 V자 모양 버튼(회전)으로 처리합니다. 접근성용 설명은 아이콘에만 붙습니다.
- **Contact**: 전체 공백을 줄이고 연구실 연락처·지도·학생 대표를 명함형 카드로 정돈했습니다. 교수님 프로필과 하단 푸터의 글자도 키웠습니다.

## 페이지별 문구와 글꼴·글자 크기 조정

Pages CMS는 **페이지별 항목**과 **콘텐츠 항목**, **공통 서체** 순으로 표시됩니다.

- `Home / 메인 화면 설정` : 메인 영문 제목·강조 제목·설명, 연구실명·연구실 소개, Explore 버튼 문구, 자동 슬라이드 간격, 글꼴/크기 설정
- `Research / 페이지 문구 · 글꼴 · 크기` : Research 소개 페이지 제목·설명 및 글꼴/크기
- `People / Professor`, `People / Students`, `People / Alumni` : 각 페이지의 제목·소개 문구·글꼴·크기 메뉴와 원래 콘텐츠 관리 메뉴
- `Publications`, `News`, `Gallery`, `Equipment`, `Contact` : 해당 페이지 제목과 설명, 글꼴·크기를 한 메뉴에서 관리. 콘텐츠 목록은 해당 페이지 바로 아래의 목록 메뉴에서 관리
- `Contact / 페이지 문구 · 글꼴 · 크기` : 페이지 제목 외에도 왼쪽 명함형 영역의 제목, 강조문구, 짧은 소개, 이메일 버튼 문구를 수정 가능
- `공통 설정 / 사이트 글꼴 · 크기` : 전체 기본 폰트와 제목 폰트, 상단 메뉴/로고 옆 글자/푸터/캡션 크기

**글꼴 선택**: Pretendard, Noto Sans KR, Nanum Gothic, Noto Serif KR, 시스템 글꼴. 영문 이탤릭 강조도 페이지 글꼴 선택을 따릅니다. 글꼴은 CDN에서 다운로드되어 표시되므로 방문자가 해당 서비스에 접근하지 못하면 시스템 폴백 글꼴을 사용합니다.

**숫자 설정**: 페이지 제목/본문/라벨/섹션 제목 크기(px). `0`은 기본값을 사용합니다. 내용이 많거나 모바일 환경에서는 가독성과 넘침을 위해 글자 크기가 자동 제한/줄바꿈될 수 있습니다.

**개별 내용 스타일**: Research·Professor Employment/Awards·Students·Alumni·Publications·News·Gallery·Equipment 콘텐츠 항목을 열면 `이 항목만의 글꼴 · 글자 크기 (선택)`이 추가됩니다. 본문과 제목 글꼴·크기를 개별 지정할 수 있고, 비우면 페이지별 기본 설정을 따릅니다. Research의 세부 블록에도 동일한 선택 기능이 있습니다.

이 구조는 안전한 글꼴/크기 프리셋을 제공하는 방식이며, CMS가 웹페이지의 임의 영역을 클릭해서 CSS를 직접 편집하는 WYSIWYG 디자인 편집기로 바뀌는 것은 아닙니다.

## 주의사항

- 모든 기존 콘텐츠를 보존하려면 **업데이트 전용 ZIP**을 사용하세요. 전체 ZIP은 배포 템플릿과 예시 JSON을 포함하므로 이미 수정한 내용을 덮어쓸 위험이 있습니다.
- 공통 서체/페이지 서체는 자동으로 새 `data/typography.json` / `data/page-*.json`에서 반영됩니다. HTTP GitHub Pages에서 실시간 JSON을 읽습니다. 로컬 파일을 더블클릭해 미리보려면 전체 폴더에서 `python tools/refresh_preview.py`로 스냅샷을 갱신하세요.
- 배포 완료 후 `Ctrl + F5`로 캐시를 지우고 확인하세요. `site.js` 및 `styles.css`는 `?v=10`으로 갱신해 캐시 충돌을 줄였습니다.
- Pages CMS의 실제 GitHub 로그인·저장 동작은 사용자의 연결 계정에서 확인해야 합니다.
