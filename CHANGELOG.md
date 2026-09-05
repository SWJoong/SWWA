# 변경 이력

이 프로젝트의 주요 변경을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/),
버전은 [유의적 버전(semver)](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-09-05

첫 릴리스. KWCAG 2.2 웹 접근성 검사·리뷰·인증 준비를 돕는 Claude Code 플러그인(스킬 3종) +
MCP 서버(`swwa-mcp`).

### Added
- **MCP 도구 7종**: `check_html`(정적 검사)·`check_contrast`(명도 대비)·`lookup_checkpoint`(검사항목 조회)·`get_checklist`(체크리스트)·`audit_url`(브라우저 감사)·`browser_status`(브라우저 가용성)·`estimate_cert_readiness`(인증 준비도).
- **프롬프트 2종**: `review-markup`·`audit-report`.
- **리소스 6종**: `swwa://kwcag22`·`swwa://kwcag22/{id}`·`swwa://mapping/wcag22`·`swwa://certification`·`swwa://mobile-app-2.0`·`swwa://sources`.
- **스킬 3종**: `kwcag-guide`(지식)·`a11y-review`(코드 리뷰)·`a11y-audit`(사이트 감사).
- **정적 엔진**: jsdom + axe-core(한국어 로케일) + 자체 T1 `k-` 규칙 18종. worker_threads 하드 타임아웃으로 대용량 입력에서도 서버가 멈추지 않고 안전하게 실패.
- **브라우저 엔진**: playwright-core + @axe-core/playwright + 자체 `b-` 규칙 6종. 설치된 Chrome→Edge→Playwright chromium 순 채널 탐지.
- **데이터**: KWCAG 2.2 검사항목 33개 단일 소스, WCAG 2.2 매핑, axe 규칙 매핑, 품질인증 기준, 한국어 링크·대체텍스트 사전.

### Notes
- 자동 판정은 전문가·사용자 심사를 대체하지 않는 **참고 결과**입니다.
- 품질인증 기준 수치(전문가 95%·사용자 100%·평균 90)와 일부 법령 조항은 인증기관 공지로 재확인이 필요한 잠정치입니다(`needsVerification`).
- 대용량·조밀 페이지 정적 검사 성능·warm worker pool 재사용은 백로그입니다(`docs/plan/03-backend-plan.md` §5.1).

[Unreleased]: https://github.com/SWJoong/SWWA/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/SWJoong/SWWA/releases/tag/v0.1.0
