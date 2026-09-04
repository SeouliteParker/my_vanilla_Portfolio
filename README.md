# Vanilla JavaScript 반응형 포트폴리오 웹사이트

외부 UI 라이브러리(React, Bootstrap, jQuery 등) 없이 웹 표준 순수 HTML, CSS, JavaScript만을 활용하여 제작한 반응형 개인 포트폴리오 웹사이트입니다.

## 배포 주소
- **배포 URL:** https://SeouliteParker.github.io/my_vanilla_Portfolio/
- **GitHub 저장소:** https://github.com/SeouliteParker/my_vanilla_Portfolio

## 주요 기술 스택
- **HTML5:** 시맨틱 마크업 설계 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- **CSS3:** CSS 변수(`:root`, `[data-theme="dark"]`), Flexbox, CSS Grid (`auto-fit`, `minmax`), 미디어 쿼리
- **JavaScript (ES6+):** DOM 조작, 비동기 통신 (`fetch`, `async/await`), `IntersectionObserver`, `LocalStorage`

## 인터랙션 설정 기준값
- **네비게이션 배경 스타일 전환:** 스크롤 높이 60px 초과 시 반투명/배경 전환
- **스크롤 탑 버튼(Scroll-to-Top):** 스크롤 높이 300px 초과 시 화면 우하단 노출
- **섹션 스크롤 애니메이션:** `IntersectionObserver` 임계값 `threshold: 0.2`

## 상태 관리 및 렌더링 흐름
1. **다크 모드 상태:** 시스템 색상 환경 및 로컬스토리지 테마값 읽기 → 상태 변경 이벤트(`click`) → `data-theme` 속성 동적 갱신
2. **비동기 API 상태:** `fetch` 요청 시작(로딩 UI) → 응답 수신 성공(카드 Grid 렌더링) / 빈 목록(Empty UI) / 오류 및 호출 제한(Error UI + 재시도 핸들러)
3. **폼 유효성 검사:** 폼 전송 이벤트(`submit`) 가로채기(`preventDefault`) → 공백 및 정규식 검증 → 필드별 피드백 메시지 제어

## 화면 구성
- 데스크톱, 태블릿, 모바일 뷰 지원
- 다크 모드 / 라이트 모드 지원