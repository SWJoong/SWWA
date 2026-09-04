---
name: a11y-audit
description: 실제 사이트·페이지를 KWCAG 2.2 기준으로 감사하고 인증 준비도 보고서를 작성할 때 사용한다. "사이트 접근성 감사해줘", "인증 준비 상태 알려줘", "여러 페이지 접근성 점검" 같은 요청 시 사용한다.
---

# a11y-audit (구현 중)

> T-10에서 본문을 작성한다(레인: U). 현재는 스캐폴드 단계(T-02) 골격만 존재한다.

## 예정 개요

- `swwa` MCP 서버의 `audit_url`·`browser_status`·`estimate_cert_readiness` 도구와 `audit-report` 프롬프트를 활용해 페이지 표본을 수집하고 33개 검사항목 준수율을 집계한다.
- 페이지 표집 전략, 감사 흐름, 사용자 심사(장애 유형별 과업) 체크리스트, 보고서 템플릿은 `references/`에 둔다.
- 자동 검사만으로 인증 통과를 판단하지 않으며, 수동·사용자 심사 잔여 항목을 항상 명시한다.

## references/ (T-10 예정)

`audit-flow.md` · `page-sampling.md` · `report-template.md` · `user-eval-checklist.md`
