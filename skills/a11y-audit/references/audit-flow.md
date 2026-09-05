# 감사 흐름 (a11y-audit)

## 1. 준비
- `browser_status` 호출. `available=false`면:
  - 사용자에게 `npx playwright install chromium` 또는 Chrome/Edge 설치 안내.
  - 정적 대안: 페이지 HTML을 받아 `check_html`로 부분 감사(명도 대비·초점·타깃 크기는 판정 불가 → manual).

## 2. 표집
- 사이트 유형별 대표 페이지 선정([page-sampling.md](page-sampling.md)).
- 페이지 수는 목적에 맞게: 빠른 점검 3~5개, 인증 자가진단은 유형을 폭넓게.

## 3. 페이지별 감사
- 각 URL에 `audit_url` 호출:
  - `viewport`: 반응형이면 desktop·mobile 각각.
  - `checks`: 기본 전부(`axe`·`b-rules`·`keyboard`). 빠르게는 일부만.
  - `waitFor`: SPA·지연 로딩은 `networkidle` 또는 특정 셀렉터.
  - `outputDir`: 지정하면 Report JSON·스크린샷 저장(뒤에서 `estimate_cert_readiness`의 `reportPaths`로 재사용).
- 로컬 개발 서버(`http://localhost:...`)·`file://`도 감사 가능(사설/localhost 허용, 링크로컬·메타데이터 호스트는 차단).

## 4. 집계
- 모은 Report(또는 저장한 파일 경로)를 `estimate_cert_readiness`에:
  - `reports`(인라인) 또는 `reportPaths`(파일) 택1, 1~50건.
  - `pageCount`로 표본 총 수 보정 가능.
- 결과: 검사항목별 `complianceRate`·`failingPages`, `overall`(커버리지·추정 준수율), `gaps`(우선순위), `manualRemaining`.

## 5. 보고서
- `audit-report` 프롬프트에 `siteName`·`reportJson`(단건 또는 배열)·`audience` 전달.
- [report-template.md](report-template.md) 형식으로 작성. 검사항목은 `6.4.1(2.4.1)` 인용.

## 6. 잔여 심사 안내
- 자동으로 판정 못한 항목 + 사용자 심사([user-eval-checklist.md](user-eval-checklist.md))를 명시.
- "이 감사는 전문가·사용자 심사를 대체하지 않는 참고 결과"임을 보고서 말미에 고지.

## 오류 대응
- `E_NO_BROWSER`: 설치 안내 + 정적 대안. `E_BLOCKED_URL`: 허용되지 않는 호스트/스킴.
- `E_NAV`/`E_TIMEOUT`: URL·네트워크·`waitFor`·`timeoutMs` 조정 후 재시도.
