---
name: a11y-audit
description: 실제 사이트·페이지를 KWCAG 2.2 기준으로 감사하고 인증 준비도 보고서를 작성할 때 사용한다. "사이트 접근성 감사해줘", "인증 준비 상태 알려줘", "여러 페이지 접근성 점검" 같은 요청 시 사용한다.
---

# a11y-audit

실제 사이트·페이지를 KWCAG 2.2 기준으로 감사하고, 여러 페이지를 집계해 웹 접근성 품질인증
준비도 보고서를 작성하는 스킬이다. 렌더링·측정은 `swwa` MCP 서버가, 표집·해석·보고서 작성은
이 스킬이 안내한다.

## 언제 사용하는가

- "사이트/페이지 접근성 감사", "인증 준비 상태", "여러 페이지 점검" 요청
- 배포 전 접근성 종합 점검, 품질인증 신청 전 자가 진단

## 감사 절차

1. **브라우저 확인** — `browser_status`로 Chrome/Edge/chromium 가용성 확인. 없으면 설치 안내
   (`npx playwright install chromium`)하고, 정적 대안으로 `check_html`을 쓸 수 있음을 알린다.
2. **페이지 표집** — 대표 페이지를 고른다. [page-sampling.md](references/page-sampling.md) 참고
   (메인·목록·상세·폼·로그인·검색결과 등 유형별 1개 이상).
3. **페이지별 감사** — 각 URL에 `audit_url` 호출(viewport desktop/mobile, checks 기본 전부).
   결과 Report를 모은다(`outputDir` 지정 시 파일로 저장 가능).
4. **집계** — 모은 Report를 `estimate_cert_readiness`에 넘겨 검사항목별 준수율·gaps·
   manualRemaining·추정 준수율을 얻는다.
5. **보고서 작성** — `audit-report` 프롬프트 + [report-template.md](references/report-template.md)
   형식으로: 요약 → 33항목 판정표 → 우선순위 조치 → 수동·사용자 심사 잔여 → 인증 준비도 → 면책.
6. **사용자 심사 안내** — [user-eval-checklist.md](references/user-eval-checklist.md)로 장애 유형별
   과업 예시를 제시(자동 감사가 대체할 수 없는 부분).

자세한 흐름은 [audit-flow.md](references/audit-flow.md).

## 도구 선택

| 단계 | 도구 |
|---|---|
| 브라우저 가용성 | `browser_status` |
| 페이지 감사(동적) | `audit_url` |
| 코드 조각 정적 검사 | `check_html` |
| 색상 대비 | `check_contrast` |
| 다중 페이지 집계·준비도 | `estimate_cert_readiness` |
| 검사항목·인증 기준 조회 | `lookup_checkpoint` / 리소스 `swwa://certification`(또는 `kwcag-guide` 스킬) |

## 원칙

- 자동 검사 결과는 **전문가·사용자 심사 전 참고 결과**다. 인증 통과 여부를 단정하지 않는다.
- 품질인증 기준 수치(전문가 95%·사용자 100%·평균 90)는 인증기관 공지로 재확인이 필요함을 명시한다
  (데이터에 `needsVerification` 표시).
- 브라우저가 없으면 정적 경로로 낮춰 감사하되, 판정 못한 항목을 정직하게 `manual`로 보고한다.

## 참고 자료 (references/)

[audit-flow.md](references/audit-flow.md) · [page-sampling.md](references/page-sampling.md) · [report-template.md](references/report-template.md) · [user-eval-checklist.md](references/user-eval-checklist.md)
