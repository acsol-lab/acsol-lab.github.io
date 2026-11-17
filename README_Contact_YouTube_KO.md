# ACSoL Contact · 유튜브 영상 배치 업데이트

기준: 사용자가 제공한 **`유튜브 링크 삽입 이전.zip`** 안의 실제 `acsol-lab.github.io-main/` 파일.

## 적용 방식

이 ZIP은 **전체 홈페이지가 아닌 변경 파일만** 들어 있는 업데이트 패키지입니다.
GitHub 저장소 `acsol-lab/acsol-lab.github.io`의 최상위에 아래 **5개 파일을 동일한 경로로 덮어쓰기** 하세요.

- `contact.html`
- `contact-layout.css`
- `site.js`
- `.pages.yml`
- `data/contact-display.json`

다른 페이지, 학생/연구/뉴스 데이터, 이미지/영상 파일은 변경하지 않습니다.

**중요:** GitHub 저장소에서 이미 추가 수정이 있었다면, ZIP 생성 기준은 이번 업로드한 압축파일이므로 변경 내용을 비교하고 병합하세요.

## CMS에서 유튜브 영상 지정

1. GitHub에 위 5개 파일을 커밋하고 Pages 배포가 끝나면 Pages CMS에 접속합니다.
2. **01 · 사이트 콘텐츠 → Contact · 연락처 → 홍보 영상 · 오른쪽 카드 문구**로 이동합니다.
3. `연구실 홍보 영상 · 유튜브 링크` 필드에 **공개되었고 퍼가기 허용된 영상의 URL**을 붙여넣습니다.
   - `https://www.youtube.com/watch?v=XXXXXXXXXXX`
   - `https://youtu.be/XXXXXXXXXXX`
   - Shorts / live / embed 링크도 지원합니다.
4. 필요하다면 `영상 제목 · 접근성 설명`을 수정한 후 **Save/게시** 합니다.
5. `https://acsol.hanyang.ac.kr/contact.html`을 새로고침하여 확인합니다.

※ 요청에 실제 YouTube 영상 주소가 포함되지 않아 `youtubeUrl`은 **빈 문자열**로 설정했습니다. 링크를 입력하기 전까지 왼쪽에 '연구실 소개 영상 준비 중' 화면이 표시됩니다. 동영상을 자동 재생하지 않습니다.

## 화면 구성

- 왼쪽: 기존 'Get in touch' + 모집 포스터 영역을 하나의 반응형 유튜브 플레이어로 대체
- 오른쪽: 교수님 / Office / Laboratory / Visit us / 학생 대표 / Directions **변경 없음**
- 데스크톱: 영상과 연락처 2열 배치
- 태블릿/모바일: 영상이 먼저, 연락처가 아래로 순서대로 배치
- 영상 아래 작은 `YouTube에서 보기 ↗` 링크 제공 (퍼가기 제한 영상 등을 대비)

## 주의

- 동영상은 GitHub 서버에 업로드되는 것이 아니라 **YouTube에 호스팅**됩니다.
- 공개 영상이어도 소유자가 '퍼가기 허용'을 꺼두면 웹페이지 내 재생이 불가능할 수 있습니다. 이 경우 YouTube에서 보기 링크를 이용합니다.
- YouTube를 회사/학교 네트워크에서 차단하는 경우, 플레이어도 표시되지 않을 수 있습니다.
- URL은 허용된 YouTube 호스트와 유효한 11자리 영상 ID만 받아 iframe에 삽입합니다.
- 기존 이미지 파일은 삭제하지 않았으며 CMS에서 그 사진을 고르던 항목만 없앴습니다.
- CMS의 기존 `data/page-contact.json`에 남아 있는 이전 왼쪽 카드 문구는 **수정·삭제하지 않았습니다**. 화면 및 CMS 편집 폼에서는 사용되지 않습니다.
