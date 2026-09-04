# 00. 프로젝트 총괄 — SWWA (웹 접근성 Skill + MCP)

## 프로젝트 개요

**SWWA**는 국가표준 **KWCAG 2.2**(한국형 웹 콘텐츠 접근성 지침, KS X OT0003 · 4원칙·14지침·**33개 검사항목**)와 **웹 접근성 품질인증** 기준으로 웹 콘텐츠의 접근성을 검사·리뷰·인증 준비하도록 돕는 **Claude Code 플러그인(스킬 3종) + MCP 서버(npm `swwa-mcp`)** 다. 핵심 설계 원칙은 하나다:

> **판정·측정·지식은 서버(결정적·오프라인)가, 해석·수정안·보고서는 클라이언트 LLM이.**

서버는 API 키 없이 동작하는 결정적 도구를 제공하고, 코드 수정안·감사 보고서 작성은 Claude 같은 클라이언트 LLM이 서버의 도구·프롬프트·리소스를 활용해 수행한다. 도구의 자동 판정은 언제나 **"전문가·사용자 심사 전 참고 결과"** 다 — 도구는 인증 심사를 대체하지 않는다.

- **정적 검사**: HTML/코드 → jsdom + axe-core(한국어 로케일) + 자체 `k-` 규칙. 브라우저 불필요.
- **브라우저 감사**: URL → playwright-core + @axe-core/playwright + 자체 `b-` 규칙(초점 표시·타깃 크기·본문 바로가기 동작 등). 설치된 Chrome/Edge를 자동 사용, 없으면 선택 설치.
- **지식**: 33개 검사항목 데이터(WCAG 2.2 매핑·axe 규칙 매핑·검사 방법·오류 유형), 품질인증 절차·기준, 모바일 앱 접근성 지침 2.0 요약.
- **인증 준비도**: 여러 페이지의 결과를 검사항목별 준수율로 집계해 부족한 항목을 우선순위로 제시.

## 왜 만드나

- 국내 웹 접근성은 KWCAG 2.2 검사항목 ID와 품질인증(디지털포용법 제21조) 관점으로 판정된다. 해외 오픈소스 접근성 MCP·스킬은 전부 WCAG 기준이라 **KWCAG 검사항목 ID·인증 심사 관점·한국어 휴리스틱**(본문 바로가기, 새 창 안내, "더보기" 링크, 무의미 alt 등)이 없다.
- 전제 프로젝트 [EASYREAD](https://github.com/SWJoong/EASYREAD)(easyread-mcp, 동일 저자)의 컨벤션·파일을 최대한 재사용한다: TypeScript + Node 22, `@modelcontextprotocol/sdk` + zod, vitest, **규칙 = 파일 = 골든 테스트 1:1:1**, W/U 병렬 하네스.

## 확정 결정 (2026-09-04)

| 결정 | 선택 | 반영 |
|---|---|---|
| 검사 엔진 | **하이브리드** | 정적(jsdom+axe-core+k-규칙, 브라우저 불필요) 기본 + 브라우저(playwright-core+@axe-core/playwright+b-규칙) 선택. 브라우저 없으면 정적·지식 도구만 동작 |
| 지침 범위 | **웹 + 모바일 앱 참고** | KWCAG 2.2 33항목 완전 데이터화 + WCAG 2.2 매핑 + 품질인증 가이드. 모바일 앱 접근성 지침 2.0(KS X 3253, 4원칙·18지침)은 요약 레퍼런스 1파일 |
| 패키징 | **플러그인 + npm** | 저장소 루트 = 플러그인 루트(`.claude-plugin/plugin.json`, `skills/`, `.mcp.json`) · MCP 서버는 `swwa-mcp`로 npm 배포(이름 가용 확인 2026-09-04) |
| 작업 방식 | **W/U 병렬 하네스, 세팅은 U측 세션** | U(Ubuntu/팀, 한도 상향 계정) = 하네스 부트스트랩·스캐폴드·구현·배포 축, W(Windows/개인) = 명세·테스트·검증 축. [06-harness-engineering.md](06-harness-engineering.md) |

## 기술 스택

| 구성 | 선택 | 근거 |
|---|---|---|
| 언어/런타임 | **TypeScript, Node.js 22+** | MCP 생태계 표준, npx 배포, EASYREAD 동일 |
| MCP | `@modelcontextprotocol/sdk` **1.x**(1.30.0) | `McpServer` + `registerTool/Prompt/Resource`. 2.0은 alpha라 미채택 |
| 스키마 | zod 4 | 도구 입력·출력 검증 + 번들 데이터 검증 |
| 정적 엔진 | jsdom 30 + axe-core 4.13(`locales/ko.json`) + parse5 8(마크업 오류) | 브라우저 없이 결정적 검사 |
| 브라우저 엔진 | playwright-core 1.62 + @axe-core/playwright 4.13 | 브라우저 미동봉. 설치된 Chrome→Edge→Playwright chromium 순 채널 탐지 |
| 테스트 | vitest | 규칙 골든 테스트 + InMemory transport 계약 테스트 + dist stdio 스모크 |
| 빌드 | tsc(ESM) / tsx watch, TypeScript **~6.0**(EASYREAD 검증 버전; 7.x는 게이트 통과 후) | — |
| 디버깅 | MCP Inspector, `claude --plugin-dir .` | 마일스톤·릴리스 수동 점검 |
| transport | stdio 전용 | 로컬 1차 시나리오 |
| 배포 | npm/npx + Claude Code 플러그인 마켓플레이스(SWJoong/SWWA) → (백로그) MCPB | [05-release-plan.md](05-release-plan.md) |

## 로드맵

| 마일스톤 | 목표 상태 | WBS |
|---|---|---|
| **M1 — 걷는 뼈대** | 하네스·스캐폴드 완료, 검사항목 데이터·조회 도구 2종이 Inspector에서 동작 | T-00 ~ T-04 |
| **M2 — 정적 엔진** | `check_html`·`check_contrast`, T1 규칙 18개, 골든 테스트 초록 | T-05 ~ T-06 |
| **M3 — 브라우저 + 인증** | `audit_url`·`browser_status`·`estimate_cert_readiness`, b-규칙 6개, 프롬프트 2종 | T-07 ~ T-09 |
| **M4 — 스킬·공개** | 스킬 3종, 플러그인 E2E 3 시나리오, npm v0.1.0·마켓플레이스 설치 확인 | T-10 ~ T-12 |
| 이후 | `audit_site`, 주석 스크린샷, chrome-devtools MCP Lighthouse 연계, MCPB, 모바일 앱 체크리스트 데이터화 | 백로그 |

## 준비사항 체크리스트 (구현 착수 전)

**개발 환경**
- [ ] W: Node 22.20 · npm 10.9 · git 2.51 · gh 2.96 확인됨(2026-09-04)
- [ ] U: Node 22+, git, gh 로그인, Chrome/Edge 또는 `npx playwright install chromium`
- [ ] npm 패키지 이름 `swwa-mcp` 재확인(가용 확인 2026-09-04) · npm Trusted Publisher(OIDC) 또는 `NPM_TOKEN`(관리자, M4 전)
- [ ] GitHub `main` 브랜치 보호(PR 필수·CI required check, 관리자)

**도메인 데이터 (이 프로젝트의 진짜 준비물)**
- [ ] KWCAG 2.2 검사항목 33개 원문 문구 대조(a11ykr HTML판·웹소울랩·RRA 표준) — 단일 소스 [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md)
- [ ] 품질인증 기준 수치(전문가 95%·사용자 100%·평균 90, 유효기간) 인증기관 공지로 재확인 → `certification.json`의 `verifiedOn` 갱신
- [ ] KWCAG 2.2 원문의 WCAG 참조 번호(초안 vs 확정본) 검증 → `wcag-mapping.md`
- [ ] 저작권 검토 — 원문 전재 금지, 명칭·요구문 한 줄 인용 + 자체 요약·출처 표기(NFR-04)

## 파트별 계획 문서

| 문서 | 역할 | 핵심 내용 |
|---|---|---|
| [01-requirements.md](01-requirements.md) | PM | 페르소나·시나리오, FR-01~13(MoSCoW)·NFR-01~08, 성공 지표 |
| [02-architecture.md](02-architecture.md) | PL | ADR 9건, **MCP 인터페이스 명세(계약)**, Report/Finding 스키마, 데이터 모델 |
| [03-backend-plan.md](03-backend-plan.md) | Backend | 저장소 구조, 엔진·규칙·정규화 구현 방침, 오류·로깅 규약, 의존성 |
| [04-qa-plan.md](04-qa-plan.md) | QA | 골든·계약·데이터·스모크·브라우저 테스트 규약, 게이트, E2E 시나리오 |
| [05-release-plan.md](05-release-plan.md) | DevOps | npm·플러그인·Desktop 채널, 버전 전략, 릴리스 체크리스트 |
| [06-harness-engineering.md](06-harness-engineering.md) | 총괄 | W/U 4결정, 레인, WBS 레인 배정, U측 설치 절차 |
| [07-references.md](07-references.md) | 총괄 | 레퍼런스 조사 결과(국내 지침·인증·GitHub 오픈소스)와 반영 사항 |

**문서 간 규약**: 검사항목·규칙 ID의 단일 소스는 [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md)(W 소유)이며, 인터페이스 변경은 02 → 03/04 순서로 전파한다.

## 변경 이력

| 날짜 | 변경 | 작성 |
|---|---|---|
| 2026-09-04 | 최초 작성 (계획 수립 세션, W) | 총괄 |
