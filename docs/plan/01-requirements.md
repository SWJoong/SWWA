# 01. 요구사항 (PM)

> 입력: [00-overview.md](00-overview.md), [07-references.md](07-references.md), 단일 소스 [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md)

## 1. 페르소나

| ID | 페르소나 | 목표 | 주 사용 스킬/도구 |
|---|---|---|---|
| P1 | 접근성 담당 기획자·복지기관 실무자 | 우리 사이트가 KWCAG 2.2 어느 항목에서 걸리는지, 품질인증 준비가 얼마나 됐는지 알고 싶다 | `a11y-audit`, `kwcag-guide`, `estimate_cert_readiness` |
| P2 | 프론트엔드 개발자 | 작성 중인 HTML/컴포넌트를 검사항목 ID 기준으로 리뷰받고 바로 고치고 싶다 | `a11y-review`, `check_html`, `check_contrast` |
| P3 | QA·심사 보조 | 여러 페이지를 감사해 항목별 판정표·보고서를 만들고 수동 확인 항목을 놓치지 않고 싶다 | `a11y-audit`, `get_checklist`, `audit-report` 프롬프트 |

## 2. 시나리오

| ID | 시나리오 | 흐름 |
|---|---|---|
| S1 | 코드 리뷰 | 개발자가 HTML/JSX를 붙여넣고 "접근성 검토해줘" → `a11y-review` 자동 로드 → `check_html` → 검사항목 ID 인용 + before/after 수정안 + 수동 확인 목록 |
| S2 | URL 감사 | `/swwa:a11y-audit https://…` → `browser_status` → `audit_url`(axe·b-규칙·키보드) → 33항목 판정표 + 보고서 |
| S3 | 인증 준비 | 표본 페이지 N개 감사 → `estimate_cert_readiness` → 검사항목별 준수율·95% 미달 항목·수동 잔여 항목·우선순위 |
| S4 | 지식 질의 | "2.4.1 반복 영역 건너뛰기 판정 기준이 뭐야?" → `kwcag-guide` → `lookup_checkpoint` → 요구사항·검사 방법·흔한 오류·WCAG 대응 |
| S5 | 브라우저 없음 | `browser_status.available=false` → 스킬이 설치 안내 + 정적 대안(`check_html`)으로 진행하며 렌더링 필요 항목은 "브라우저 감사 필요"로 고지 |

## 3. 기능 요구사항 (MoSCoW)

| ID | 요구사항 | 우선순위 | 마일스톤 |
|---|---|---|---|
| FR-01 | `check_html`: HTML 문자열·파일을 정적 검사(axe + k-규칙)하고 33항목 상태표·Finding 목록을 반환 | Must | M2 |
| FR-02 | `check_contrast`: 전경·배경색·글자 크기로 명도 대비와 KWCAG 5.4.3(1.4.3) 판정 반환 | Must | M2 |
| FR-03 | `lookup_checkpoint`: KWCAG ID/별칭/WCAG SC/axe 규칙/키워드로 검사항목 조회 | Must | M1 |
| FR-04 | `get_checklist`: 검사항목·컴포넌트·페이지·사용자 심사 범위의 수동 체크리스트 | Must | M1 |
| FR-05 | `audit_url`: URL을 브라우저로 감사(axe + b-규칙 + 키보드 순회), 스크린샷 선택 | Must | M3 |
| FR-06 | `browser_status`: 브라우저 가용성·채널·설치 안내 | Must | M3 |
| FR-07 | `estimate_cert_readiness`: 여러 Report를 검사항목별 준수율로 집계, 인증 기준 대비 격차·우선순위 | Should | M3 |
| FR-08 | 프롬프트 `review-markup`, `audit-report` | Should | M3 |
| FR-09 | 리소스 `swwa://kwcag22`, `swwa://kwcag22/{id}`, `swwa://mapping/wcag22`, `swwa://certification`, `swwa://mobile-app-2.0`, `swwa://sources` | Should | M1 |
| FR-10 | 스킬 3종 `kwcag-guide`, `a11y-review`, `a11y-audit` | Must | M4 |
| FR-11 | 플러그인(`.claude-plugin`, `.mcp.json`, 런처) + npm `swwa-mcp` 이중 배포 | Must | M4 |
| FR-12 | `audit_site`: 동일 출처 페이지 최대 20개 크롤 감사, 도움 링크 위치 일관성(7.2.2) | Could | 백로그 |
| FR-13 | 위반 요소 주석 스크린샷, chrome-devtools MCP `lighthouse_audit` 연계 | Could | 백로그 |

## 4. 비기능 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| NFR-01 | **오프라인·결정성**: 정적 경로는 네트워크 0, 동일 입력 → 동일 출력. 데이터는 번들 정적 파일, 런타임 fetch 금지 | 골든 테스트 반복 실행 동일, 네트워크 차단 환경 스모크 |
| NFR-02 | **브라우저 선택성**: 브라우저가 없어도 정적·지식 도구는 모두 동작, `audit_url`만 `E_NO_BROWSER` 안내 | 채널 탐지 강제 실패 테스트 |
| NFR-03 | **프라이버시**: 입력 HTML·페이지 내용·스크린샷을 저장·전송하지 않음(요청한 `outputDir`에만 저장). stdout은 JSON-RPC, 로그는 stderr, 오류 응답에 스택·입력 본문 없음 | `tests/privacy` |
| NFR-04 | **저작권**: 표준·제작기법·번역 원문 전재 금지. 검사항목 명칭·요구 문장 한 줄만 인용, 나머지 자체 요약·출처 표기(`sources.json`) | 데이터 리뷰, `sources` 필드 필수 검증 |
| NFR-05 | **크로스플랫폼**: Windows·Ubuntu, Node 22/24 | CI 매트릭스 |
| NFR-06 | **성능**: 500KB HTML `check_html` ≤ 2초, `audit_url` 기본 타임아웃 30초, 서버 기동 ≤ 1.5초 | `tests/integration/perf.test.ts` |
| NFR-07 | **보안**: URL 스킴 http/https/file만, 링크로컬(169.254.0.0/16)·클라우드 메타데이터 호스트 차단, 임시 브라우저 프로필·쿠키 미보존, 입력 2MB 상한, jsdom 페이지 스크립트 비실행 | `tests/tools/audit-url.test.ts`, `url-guard` 단위 테스트 |
| NFR-08 | **정직한 보고**: 모든 Report에 자동 검사 한계 고지, Finding에 `confidence`, 판정 불가 항목은 `manual`/`incomplete`로 표시(추정 pass 금지) | 계약 테스트 |

## 5. 성공 지표

| 지표 | 목표 |
|---|---|
| 자동 판정 커버리지(33항목) | 자동 7 · 보조 17 · 수동 8 · N/A 1 (단일 소스 표 기준), 각 항목 상태가 Report에 항상 표시 |
| 골든 테스트 | T1 규칙 18개 × fail/pass 픽스처 100% 통과, 오탐 0(픽스처 pass에서 fail 없음) |
| 계약·스모크 | 도구 7·프롬프트 2·리소스 6 노출, dist stdio initialize ≤ 1.5초 |
| 플러그인 E2E | [04-qa-plan.md](04-qa-plan.md) §5의 3 시나리오 통과 |
| 설치 | `npx -y swwa-mcp` 또는 `/plugin install` 후 5분 내 첫 검사 |
| 데이터 정합 | md 단일 소스 ↔ `kwcag22.json` 33건 ID·명칭·WCAG·등급 동일, `axeRules` 전부 실제 axe 규칙 |

## 6. 범위 밖 (v0.1)

- 접근성 자동 수정(코드 자동 패치) — 수정안 제시는 클라이언트 LLM 몫
- 모바일 앱(네이티브) 자동 검사 — 지침 요약 레퍼런스만
- 원격 HTTP transport, 다중 사용자 서버
- Lighthouse·WAVE 등 외부 API 통합(백로그)
