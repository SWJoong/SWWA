# 용어집 (kwcag-guide)

| 용어 | 뜻 |
|---|---|
| KWCAG 2.2 | 한국형 웹 콘텐츠 접근성 지침 2.2(KS X OT0003). 4원칙·14지침·33개 검사항목 |
| 공식 번호 | 표준 본문 장 번호 `5.1.1`~`8.2.1`(5=인식, 6=운용, 7=이해, 8=견고) |
| 별칭 | 업계·인증 실무에서 쓰는 `1.1.1`~`4.2.1`. 인용은 `6.4.1(2.4.1)`처럼 병기 |
| WCAG 2.2 | W3C 국제 표준. KWCAG 검사항목이 참조하는 성공기준(SC)의 출처 |
| SC (Success Criterion) | WCAG의 성공기준(예: 2.4.1 Bypass Blocks) |
| 자동화 등급 | **자동**(도구가 fail 확정)·**보조**(후보 탐지, 사람 확정)·**수동**(체크리스트만)·**N/A**(조건부) |
| 검사항목 상태 | Report의 항목 판정: `fail`·`incomplete`·`manual`·`pass`·`na` |
| Finding | 정규화된 개별 검사 결과 1건(규칙·검사항목·영향·수정안 등) |
| verdict | Report 종합 판정: `fail`(자동 등급 fail≥1)·`needs-review`(보조 fail/incomplete)·`pass` |
| k-규칙 | 정적(jsdom) 자체 규칙(`k-*`). 브라우저 불필요 |
| b-규칙 | 브라우저(Playwright) 자체 규칙(`b-*`). 초점·타깃 크기 등 렌더링 필요 항목 |
| axe 규칙 | axe-core가 제공하는 규칙(예: `image-alt`). 한국어 메시지는 `ko.json`으로 치환 |
| 정적 검사 | `check_html` — jsdom+axe+k-규칙. 렌더링 필요 항목은 `manual`로 보고 |
| 브라우저 감사 | `audit_url` — 실제 브라우저로 axe+b-규칙 실행 |
| 인증 준비도 | `estimate_cert_readiness` — 여러 페이지 준수율 집계·추정(인증 통과 판정 아님) |
| needsVerification | 1차 출처로 아직 확정 못 한 수치·조항. 답변 시 "재확인 필요" 고지 |
| 전문가 심사 / 사용자 심사 | 품질인증의 두 심사. 자동 검사가 대체하지 못하는 부분 |
