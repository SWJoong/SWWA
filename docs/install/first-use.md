# 처음 사용해보기 (따라하기)

설치를 마쳤으면 이 순서대로 해보세요. 개발 지식이 많지 않아도 됩니다.

> 아직 설치를 안 했다면: [Claude Code 설치](claude-code.md) · [Claude Desktop 설치](claude-desktop.md)

## 1. 코드 접근성 검토하기 (a11y-review)

검토할 HTML을 준비합니다. 예:
```html
<a href="/list">더보기</a>
<img src="banner.png" alt="이미지">
```

Claude에게 부탁합니다:
> 이 HTML 접근성 검토해줘: (위 코드 붙여넣기)

- `check_html` 도구가 KWCAG 2.2 기준으로 검사합니다.
- 결과를 `6.4.1(2.4.1)` 형식으로 인용하며 before/after 수정안을 알려줍니다.
- 예: "더보기" 링크는 6.4.3(2.4.3) 위반 → 목적을 담은 텍스트로, `alt="이미지"`는 5.1.1(1.1.1) 위반 → 용도를 설명하는 대체 텍스트로.

## 2. 검사 결과 읽는 법

- **verdict**: `fail`(자동 등급 실패 있음)·`needs-review`(보조/미확정)·`pass`.
- **checkpoints**: 33개 검사항목 상태표(`fail`·`incomplete`·`manual`·`pass`·`na`).
- **findings**: 개별 문제 — 규칙 ID·영향(critical~minor)·수정안.
- **manualChecklist**: 자동으로 판정 못 해 사람이 확인해야 하는 항목.

명도 대비·초점 표시·타깃 크기는 렌더링이 필요해 정적 검사에서 `manual`로 나옵니다.
색상 쌍만 빠르게 보려면 "이 색 대비 확인해줘 #767676 / #ffffff"처럼 `check_contrast`를 씁니다.

## 3. 실제 사이트 감사하기 (a11y-audit)

> http://localhost:3000 접근성 감사해줘

- 먼저 `browser_status`로 브라우저를 확인하고 `audit_url`로 실제 렌더링을 감사합니다.
- 여러 페이지를 감사하면 `estimate_cert_readiness`로 인증 준비도를 집계합니다.
- 브라우저가 없으면 설치 안내(`npx playwright install chromium`)와 함께 정적 검사로 대체합니다.

## 4. 검사항목·인증 기준 물어보기 (kwcag-guide)

> KWCAG 2.4.1이 뭐야? 인증 통과 기준은?

- `lookup_checkpoint`로 검사항목 뜻·WCAG 매핑을 답하고, 인증 기준 수치는 "인증기관 공지로 재확인 필요"와 함께 알려줍니다.

## 5. "심사 전 참고 결과"임을 기억하세요

이 도구의 자동 판정은 **전문가·사용자 심사를 대체하지 않는 참고 결과**입니다. 인증 통과 여부는
인증기관의 전문가 심사·사용자 심사로 최종 결정됩니다.

## 자주 막히는 곳
1. **도구가 안 보여요.** Claude Desktop은 앱을 완전히 껐다 켜고, Claude Code는 `claude mcp list` 또는 `/mcp`로 `swwa`를 확인합니다.
2. **Node 버전.** `node -v`가 22 이상인지 확인.
3. **브라우저 감사가 안 돼요.** `browser_status`로 확인하고, 없으면 `npx playwright install chromium`.

문제가 있으면 [설치 문제 신고](../../.github/ISSUE_TEMPLATE/install-problem.yml)나
[오탐·미탐 신고](../../.github/ISSUE_TEMPLATE/false-detection.yml)로 알려 주세요.
