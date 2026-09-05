# 플러그인 E2E 수행 기록 (수동)

> 04-qa-plan §5의 플러그인 E2E 3 시나리오는 `claude --plugin-dir .`로 중첩 대화형 세션을 띄워야
> 하므로 CI·자동 테스트로 실행할 수 없다. 자동으로 검증 가능한 **도구 조합**은
> `tests/integration/e2e.test.ts`가 대신 커버하고, 아래는 릴리스 전 사람이 수동으로 수행할 절차다.

## 사전 준비
```bash
npm run build
claude --plugin-dir .        # 또는 /plugin marketplace add SWJoong/SWWA 후 설치
```
확인: `/mcp`에 `swwa` 도구 7개, `/help`에 스킬 3종(a11y-review·a11y-audit·kwcag-guide) 노출.
`claude plugin validate .` 통과(자동 게이트로도 확인됨).

## 시나리오

### E2E-1 코드 리뷰 (a11y-review)
- 입력: `/swwa:a11y-review tests/fixtures/html/k-skip-link-first/fail.html`
- 기대: `check_html` 호출, `6.4.1(2.4.1)` 형식 인용, before/after 수정안, 수동 확인 목록,
  "전문가·사용자 심사 전 참고 결과" 고지.
- 자동 대응: `tests/integration/e2e.test.ts` E2E-1(check_html → 6.4.1 fail).

### E2E-2 사이트 감사 (a11y-audit)
- 입력: `/swwa:a11y-audit http://localhost:<port>/pages/sample.html`
  (로컬 서버는 `node scripts/serve-fixtures.mjs <port>`로 기동)
- 기대: `browser_status` → `audit_url` → 33항목 판정표·보고서·`estimate_cert_readiness` 준비도.
  브라우저 없는 환경에서는 설치 안내 + `check_html` 대안 경로.
- 자동 대응: `tests/browser/audit-url.test.ts`(audit_url 동작) + e2e.test.ts E2E-2(집계).

### E2E-3 지식 질의 (kwcag-guide)
- 입력: "KWCAG 2.4.1이 뭐야? 인증 통과 기준은?"
- 기대: `kwcag-guide` 자동 로드, `lookup_checkpoint` 호출, 인증 기준을 "확인 필요" 표기와 함께 답변.
- 자동 대응: e2e.test.ts E2E-3(lookup_checkpoint 2.4.1 + get_checklist).

## 수행 기록
| 날짜 | 수행자 | 환경 | 결과 | 비고 |
|---|---|---|---|---|
| (미수행) | | | | `claude --plugin-dir .` 대화형 세션 필요. 자동 도구 조합은 e2e.test.ts로 통과 확인 |

> 릴리스(T-12) 전에 위 표를 채운다. 현재는 자동 검증(플러그인 validate + Inspector + e2e.test.ts)으로
> 도구·프롬프트·리소스·스킬 구조와 도구 조합이 정상 동작함을 확인한 상태다.
