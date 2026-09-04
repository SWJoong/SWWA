# 02. 아키텍처 설계 (PL)

> 입력: [01-requirements.md](01-requirements.md), 단일 소스 [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md), [07-references.md](07-references.md)
> **이 문서의 §3 인터페이스 명세가 Backend·QA의 계약이다.** 변경은 02 → 03/04 순서로 전파한다.

## 1. 아키텍처 개요

```
클라이언트 LLM (Claude Code 플러그인 스킬 3종 / Claude Desktop npx / Cursor 등)
   │ JSON-RPC(stdio)
swwa-mcp
 ├─ tools/      check_html · check_contrast · lookup_checkpoint · get_checklist
 │              audit_url · browser_status · estimate_cert_readiness · (audit_site: 백로그)
 ├─ prompts/    review-markup · audit-report
 ├─ resources/  swwa://kwcag22 · swwa://kwcag22/{id} · swwa://mapping/wcag22
 │              swwa://certification · swwa://mobile-app-2.0 · swwa://sources
 ├─ engine/static   jsdom + axe-core(ko) + rules/k/*           ← 브라우저 불필요
 ├─ engine/browser  playwright-core + @axe-core/playwright + rules/b/*   ← 선택
 ├─ normalize/      axe→Finding · k/b→Finding · 33항목 집계 · ko.json 메시지 치환
 ├─ report/         summary · checkpoints · cert readiness · 한국어 텍스트 요약
 └─ data/           assets/*.json 로더(zod 검증, 실패 시 기동 중단)
```

데이터 흐름(S1 코드 리뷰): 스킬이 `check_html` 호출 → 정적 엔진이 axe·k-규칙 실행 → 정규화(Finding) → 33항목 상태표·요약 → `structuredContent`(Report) + `content`(한국어 요약) 반환 → 클라이언트 LLM이 검사항목 ID를 인용해 수정안 작성. **서버는 결정적 로직만 수행하며 입력·페이지를 저장하지 않는다**(NFR-01·03).

## 2. 아키텍처 결정 기록 (ADR)

| ID | 결정 | 근거 | 기각한 대안 | 영향 |
|---|---|---|---|---|
| ADR-01 | 판정·측정·지식은 서버, 해석·수정안·보고서는 클라이언트 LLM | API 키·비용·개인정보 없음, 모든 MCP 클라이언트 호환(EASYREAD ADR-01 계승) | 서버의 LLM API 직접 호출 | 스킬·프롬프트 설계가 품질을 좌우 |
| ADR-02 | **하이브리드 엔진**: `static`(jsdom+axe+k-규칙) 기본, `browser`(playwright-core+axe+b-규칙) 선택 | 설치 마찰 최소. 렌더링 필요 항목(명도 대비·초점·타깃 크기)은 브라우저에서만 판정 | 브라우저 전용(설치 마찰·CI 부담) / 정적 전용(렌더링 항목 판정 불가) | 정적 모드는 렌더링 필요 규칙을 비활성하고 해당 항목을 `manual`로 보고 |
| ADR-03 | 브라우저는 `playwright-core`(브라우저 미동봉)로 **설치된 Chrome → Edge → Playwright chromium** 순 채널 탐지 | 수백 MB 브라우저 강제 다운로드 회피 | `playwright` 정식 의존(브라우저 동봉) | 없으면 `browser_status`가 `npx playwright install chromium` 안내 |
| ADR-04 | **검사항목 단일 소스 = `skills/kwcag-guide/references/kwcag22-checklist.md`**(W 소유). `assets/kwcag22.json`은 이를 기계화, 테스트가 정합 검증 | 문서·코드·테스트를 검사항목 ID로 연결(EASYREAD ADR-03) | 코드 주석·JSON을 소스로(비개발자 검토 불가) | 변경 절차: md(W) → json(U) → 테스트(W) |
| ADR-05 | 규칙 1개 = 파일 1개 = 픽스처 fail/pass 1쌍 = 골든 테스트 1개, 규칙은 순수 함수 `(ctx) => Finding[]` | 레인 분리·실패 지점 특정·병렬화 | 규칙 묶음 파일 | 규칙 실행은 개별 try/catch로 격리 |
| ADR-06 | axe 결과·자체 규칙 결과를 **하나의 Finding 스키마로 정규화**하고 **33항목 상태표를 항상 출력** | 인증 심사(항목별 판정) 관점과 일치, 자동 검사 범위를 정직하게 노출 | axe 원본 결과 그대로 반환 | 매핑 테이블(`axe-rule-map.json`) 유지 필요 |
| ADR-07 | 한국어 메시지: axe는 `axe-core/locales/ko.json`을 **정규화 단계에서** 적용, 자체 규칙은 `src/messages.ts` | 엔진(jsdom/브라우저) 무관 단일 경로. `@axe-core/playwright`가 `axe.configure({locale})`를 노출하지 않음 | 페이지 컨텍스트에서 `axe.configure` | ko.json에 없는 규칙은 영어 원문 유지 |
| ADR-08 | 데이터는 패키지 번들 정적 JSON/MD, 런타임 fetch 금지 | 오프라인·결정성(NFR-01) | 외부 API·DB | 데이터 갱신 = 패키지 릴리스 |
| ADR-09 | stdio 전용, stdout은 JSON-RPC, 로그는 stderr, 페이지 내용·스크린샷은 `outputDir` 지정 시에만 파일 저장 | 프라이버시(NFR-03) | 결과 자동 저장 | — |

## 3. MCP 인터페이스 명세

서버 식별: `name: "swwa"`. 모든 도구는 `annotations: { readOnlyHint: true, openWorldHint: false }`(`audit_url`만 `openWorldHint: true`). 오류 시 입력 본문·스택을 응답에 싣지 않는다. 오류 코드: `E_INPUT`(입력 검증), `E_SIZE`(2MB 초과), `E_NOT_FOUND`(파일), `E_NO_BROWSER`, `E_BLOCKED_URL`, `E_NAV`(내비게이션 실패), `E_TIMEOUT`, `E_INTERNAL`.

### 3.1 Tools

#### `check_html` (FR-01)
- 설명(도구 description): "HTML 문자열이나 로컬 HTML 파일을 KWCAG 2.2 기준으로 정적 검사한다. 웹 UI 코드를 작성·수정·리뷰할 때 반드시 호출한다. 브라우저 없이 동작하며, 렌더링이 필요한 항목(명도 대비·초점 표시·타깃 크기)은 '브라우저 감사 필요'로 표시한다."
- 입력(zod):

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| `html` | string | `path`와 택1 | 1~2,000,000자 |
| `path` | string | `html`과 택1 | 로컬 파일 경로(.html/.htm) |
| `baseUrl` | string | — | 상대 링크·`#target` 해석용 |
| `ruleset` | enum `kwcag22` \| `wcag22aa` | — | 기본 `kwcag22`(axe 태그 wcag2a·wcag2aa·wcag21a·wcag21aa·wcag22aa·best-practice + k-규칙) |
| `excludeRules` | string[] | — | axe·k 규칙 ID |
| `maxFindings` | number | — | 기본 200 |

- 출력 `structuredContent`: **Report**(§4), `engine.mode = "static"`. `content`에는 한국어 요약(판정·항목별 fail/incomplete 수·상위 Finding·수동 확인 안내).
- 정적 모드 비활성 axe 규칙(`STATIC_DISABLED_RULES`): `color-contrast`, `color-contrast-enhanced`, `link-in-text-block`, `target-size`, `scrollable-region-focusable`, `no-autoplay-audio`, `frame-tested`, `css-orientation-lock`. 이들이 담당하는 검사항목은 다른 규칙이 없으면 `manual` + notice "브라우저 감사 필요".
- 오류: 둘 다 없음/둘 다 있음 → `E_INPUT`, 크기 초과 → `E_SIZE`, 파일 없음 → `E_NOT_FOUND`.

#### `check_contrast` (FR-02)
- 입력: `foreground`, `background`(hex/rgb()/rgba()/hsl()/CSS 색 이름, 필수), `fontSizePx`(기본 16), `bold`(기본 false).
- 출력: `{ ratio: 4.52, largeText: false, aa: "pass"|"fail", aaa: "pass"|"fail", kwcag: "5.4.3", alias: "1.4.3", threshold: 4.5|3.0 }`. 큰 글자 = 24px 이상 또는 18.66px 이상 굵게(WCAG 18pt/14pt bold 환산).
- 알파가 있는 전경색은 배경에 합성 후 계산. 파싱 실패 → `E_INPUT`.

#### `lookup_checkpoint` (FR-03)
- 입력: `query`(string, 필수, 1~100자 — KWCAG ID `6.4.1`, 별칭 `2.4.1`, WCAG SC `2.4.1`(접두 `wcag:` 권장), axe 규칙 ID, 키워드), `detail`(enum `summary`|`full`, 기본 `summary`).
- 출력: `{ matches: Checkpoint[], relatedWcag: [{ sc, name_ko, level, kwcagIds }] }`. `Checkpoint`는 §5 `kwcag22.json` 항목(`summary`는 `testMethod_ko`·`commonErrors_ko`·`passExamples_ko` 생략). 미매치는 오류가 아니라 `matches: []` + 부분 일치 후보.
- 모호한 숫자(`2.4.1`은 KWCAG 별칭이자 WCAG SC)는 **KWCAG 별칭 우선**, `relatedWcag`에 WCAG 해석을 함께 제공.

#### `get_checklist` (FR-04)
- 입력: `scope`(enum `checkpoint`|`component`|`page`|`user-eval`, 필수), `id`(KWCAG ID/별칭, `scope=checkpoint`일 때 필수), `component`(enum form|table|image|media|link|navigation|modal|carousel|auth|iframe|widget, `scope=component`일 때 필수).
- 출력: `content` 마크다운 체크리스트, `structuredContent: { scope, items: [{ kwcag, alias, question, how, evidence }] }`. `user-eval`은 장애 유형별(시각·청각·지체·인지) 과업 예시.

#### `audit_url` (FR-05)
- 설명: "실제 브라우저로 URL을 열어 KWCAG 2.2 기준 감사(axe + 초점·타깃 크기·본문 바로가기 등 동적 검사)를 수행한다. 사이트 점검·인증 준비 시 호출한다. 먼저 `browser_status`로 브라우저 가용성을 확인하라."
- 입력:

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| `url` | string | ✅ | http/https/file, localhost 허용, 링크로컬·메타데이터 호스트 차단(NFR-07) |
| `viewport` | enum `desktop`(1280×800) \| `mobile`(375×812, 터치·모바일 UA) | — | 기본 desktop |
| `waitFor` | `load` \| `networkidle` \| CSS 셀렉터 | — | 기본 `load` + 500ms |
| `timeoutMs` | number | — | 기본 30000, 최대 120000 |
| `checks` | (`axe` \| `b-rules` \| `keyboard`)[] | — | 기본 전부. `keyboard` = Tab 순회 기반 b-규칙(초점 표시·순서·본문 바로가기 동작) |
| `screenshot` | boolean | — | true면 `outputDir`에 PNG 저장(경로만 반환) |
| `outputDir` | string | — | 지정 시 Report JSON·스크린샷 저장 |
| `headers` | Record<string,string> | — | 인증 헤더 등. 로그·응답에 남기지 않음 |
| `excludeRules`, `maxFindings` | — | — | `check_html`과 동일 |

- 출력: Report(`engine.mode = "browser"`) + `meta: { finalUrl, title, viewport, browser: { channel, version }, durationMs, screenshotPath? }`.
- 오류: `E_NO_BROWSER`(설치 안내 포함), `E_BLOCKED_URL`, `E_NAV`, `E_TIMEOUT`.

#### `browser_status` (FR-06)
- 입력 없음. 출력: `{ available: boolean, channel: "chrome"|"msedge"|"chromium"|null, version?: string, executablePath?: string, installHint: string }`. 프로세스 내 캐시(재탐지는 `refresh: true`).

#### `estimate_cert_readiness` (FR-07)
- 입력: `reports: Report[]` 또는 `reportPaths: string[]`(택1, 1~50건), `pageCount`(선택, 표본 총 수 — 미지정 시 reports 수).
- 출력:

```jsonc
{
  "checkpoints": [ { "id": "6.4.1", "alias": "2.4.1", "name": "…", "automation": "auto", "pages": 10, "failingPages": 2,
                     "complianceRate": 0.8, "status": "fail|pass|manual|na|incomplete" } ],   // 33개
  "overall": { "autoCheckedCoverage": 0.73, "estimatedExpertRate": 0.91, "pagesAudited": 10 },
  "gaps": [ { "id": "6.4.1", "failingPages": 2, "priority": 1, "reason": "자동 등급 항목 준수율 80% < 95%" } ],
  "manualRemaining": [ { "id": "5.4.4", "name": "콘텐츠 간의 구분" } ],
  "notices": [ "전문가 심사 준수율 95% 이상·사용자 심사 성공률 100%·두 심사 평균 90점 기준은 인증기관 공지로 재확인 필요(확인일 …)",
               "자동 검사 결과만으로 인증 통과를 판단할 수 없습니다. 수동·사용자 심사 항목이 남아 있습니다." ]
}
```

- `estimatedExpertRate`는 자동·보조 등급 항목만으로 계산하며 이름 그대로 **추정치**임을 notices에 고정.

#### `audit_site` (FR-12, 백로그)
- 입력: `url`, `maxPages`(≤20), `sameOrigin`(기본 true), `sitemap`(선택). 출력: Report[] + 집계. 7.2.2 도움 링크 상대 위치 일관성 검사 포함.

### 3.2 Prompts (FR-08)

| 이름 | 인자 | 생성 메시지 뼈대 |
|---|---|---|
| `review-markup` | `html`(필수), `framework`(선택: html/react/vue/svelte), `focus`(선택: 검사항목 ID 콤마 목록) | ① 역할(KWCAG 2.2 심사관) ② `check_html` 호출 지시 ③ 결과를 `6.4.1(2.4.1)` 형식으로 인용하며 before/after 코드 ④ 자동/보조/수동 구분 ⑤ 수동 확인 목록 ⑥ "심사 전 참고 결과" 고지 |
| `audit-report` | `siteName`(필수), `reportJson`(필수), `audience`(선택: developer/manager/certification) | `skills/a11y-audit/references/report-template.md` 형식: 요약 → 33항목 판정표 → 우선순위 조치 → 수동·사용자 심사 잔여 → 인증 준비도 → 면책 고지 |

### 3.3 Resources (FR-09)

| URI | 내용 | MIME |
|---|---|---|
| `swwa://kwcag22` | 검사항목 33개 체크리스트(단일 소스 md 번들) | `text/markdown` |
| `swwa://kwcag22/{id}` | ResourceTemplate — 검사항목 1건 JSON(ID·별칭 모두 허용) | `application/json` |
| `swwa://mapping/wcag22` | WCAG 2.2 ↔ KWCAG 2.2 ↔ axe 규칙 매핑 | `application/json` |
| `swwa://certification` | 품질인증 절차·기준·기관(확인일·출처 포함) | `text/markdown` |
| `swwa://mobile-app-2.0` | 모바일 애플리케이션 콘텐츠 접근성 지침 2.0 요약 | `text/markdown` |
| `swwa://sources` | 출처·확인일·접근 상태·라이선스 메모 | `application/json` |

## 4. Report / Finding 스키마 (정규화 결과)

```jsonc
{
  "engine": { "name": "swwa", "version": "0.1.0", "axe": "4.13.0", "mode": "static" | "browser" },
  "target": { "kind": "html" | "file" | "url", "ref": "…", "title": "…" },
  "verdict": "fail" | "needs-review" | "pass",   // fail = 자동 등급 규칙 fail ≥ 1 · needs-review = 보조 fail 또는 incomplete만 · pass = 둘 다 없음
  "summary": { "fail": 3, "incomplete": 2, "manual": 12, "pass": 15, "na": 1,
               "byImpact": { "critical": 1, "serious": 2, "moderate": 0, "minor": 0 }, "truncated": false },
  "checkpoints": [ { "id": "6.4.1", "alias": "2.4.1", "name": "반복 영역 건너뛰기", "automation": "auto",
                     "status": "fail" | "incomplete" | "manual" | "pass" | "na", "findings": 2 } ],   // 항상 33개, 단일 소스 순서
  "findings": [ { "ruleId": "k-skip-link-first", "engine": "k-rule" | "axe" | "b-rule", "kwcag": "6.4.1" | null, "wcag": ["2.4.1"],
                  "impact": "critical" | "serious" | "moderate" | "minor", "outcome": "fail" | "incomplete",
                  "confidence": "high" | "medium" | "low", "selector": "a.skip", "html": "<a …>",
                  "message": "…(한국어)", "fix": "…(한국어)", "helpUrl": "…" } ],
  "manualChecklist": [ { "kwcag": "5.4.4", "alias": "1.4.4", "question": "이웃한 콘텐츠가 테두리·여백 등으로 구별되는가?" } ],
  "notices": [ "자동 검사는 33개 검사항목 중 일부만 판정합니다. 인증 통과 여부는 전문가·사용자 심사로 결정됩니다." ]
}
```

- **axe → KWCAG 매핑**: 규칙 태그 `wcagXYZ`(예: `wcag241`) → WCAG SC → `wcag22.json.kwcagIds`. 태그가 없는 best-practice·모호한 규칙은 `axe-rule-map.json` 오버라이드(예: `heading-order`→5.3.2, `label`→7.3.2, `td-headers-attr`→5.3.1). 한 axe 규칙은 **주(主) 검사항목 1개**에만 귀속(데이터 테스트로 강제). 매핑 없음 → `kwcag: null`, "기타(WCAG)" 그룹.
- **검사항목 status 규칙**: 해당 항목에 귀속된 규칙 중 fail 존재 → `fail`; incomplete만 → `incomplete`; 자동/보조 규칙이 실행되어 모두 pass → `pass`; 등급이 수동이거나 정적 모드에서 규칙이 전부 비활성 → `manual`; 6.4.4처럼 조건부 → `na`(조건 충족 근거가 없으면 `manual`로 승격).
- **impact**: axe 원본 유지, k/b 규칙은 규칙 정의값. **confidence**: axe pass/violation `high`, incomplete `medium`, 휴리스틱 k-규칙은 규칙 정의값(`low`~`high`).
- `maxFindings` 초과 시 impact·checkpoint 순으로 절단하고 `summary.truncated = true`.

## 5. 데이터 모델

`assets/` 정적 번들(ADR-08). 로딩 시 zod 검증, 실패 시 기동 중단.

```jsonc
// assets/kwcag22.json
{ "version": "2.2", "dataVersion": "0.1.0", "updatedAt": "2026-09-04", "sourceIds": ["kwcag22-a11ykr", "kwcag22-websoul", "rra-kcs"],
  "checkpoints": [ {
    "id": "6.4.1", "alias": "2.4.1",
    "principle": { "no": 6, "alias": 2, "name": "운용의 용이성" }, "guideline": { "no": "6.4", "alias": "2.4", "name": "쉬운 내비게이션" },
    "name_ko": "반복 영역 건너뛰기", "name_en": "Bypass Blocks",
    "requirement_ko": "콘텐츠의 반복되는 영역은 건너뛸 수 있어야 한다.",     // 원문 한 문장 인용
    "summary_ko": "…자체 요약…", "wcag": [ { "sc": "2.4.1", "level": "A" } ],
    "automation": "auto" | "assist" | "manual" | "na",
    "axeRules": ["bypass", "skip-link"], "kRules": ["k-skip-link-first", "k-skip-target-exists"], "bRules": ["b-skip-link-works"],
    "testMethod_ko": "…", "commonErrors_ko": ["…"], "passExamples_ko": ["…"],
    "components": ["navigation"], "newIn22": false, "sources": ["kwcag22-a11ykr"] } ] }

// assets/wcag22.json — A/AA 전부 + 참고용 AAA
{ "criteria": [ { "sc": "2.4.1", "name_en": "Bypass Blocks", "name_ko": "블록 건너뛰기", "level": "A", "since": "2.0", "kwcagIds": ["6.4.1"] } ] }

// assets/axe-rule-map.json — 오버라이드만(자동 매핑 결과와 다를 때)
{ "heading-order": { "kwcag": "5.3.2" }, "label": { "kwcag": "7.3.2" }, "td-headers-attr": { "kwcag": "5.3.1" },
  "color-contrast": { "kwcag": "5.4.3", "staticDisabled": true } }

// assets/certification.json
{ "legalBasis": [ { "law": "디지털포용법", "article": "제21조", "note": "시행령 조 번호 출처마다 상이(17/20조)", "needsVerification": true } ],
  "standard": { "name": "KWCAG 2.2", "checkpoints": 33 },
  "criteria": [ { "kind": "expert", "text": "검사항목 준수율 95% 이상", "value": 0.95, "needsVerification": true, "verifiedOn": null, "sourceUrl": "…" },
                { "kind": "user", "text": "장애유형별 과업 성공률 100%", "value": 1.0, "needsVerification": true },
                { "kind": "overall", "text": "두 심사 평균 90점 이상", "value": 90, "needsVerification": true } ],
  "validity": { "text": "1년(확인 필요)", "needsVerification": true },
  "agencies": [ { "name": "한국디지털접근성진흥원", "url": "http://www.kwacc.or.kr" }, { "name": "웹와치", "url": "https://www.webwatch.or.kr" }, { "name": "한국시각장애인연합회(웹접근성평가센터)", "url": "…" } ],
  "procedure": ["신청", "전문가 심사", "사용자 심사", "결과 통보·보완", "인증 마크 부여", "사후 관리"] }

// assets/link-text-ko.json · alt-text-ko.json
{ "generic": ["더보기", "여기", "클릭", "자세히", "바로가기", "more", "click here", "read more", "link"], "generic_prefix": ["자세히 보기"] }
{ "meaningless": ["이미지", "사진", "그림", "img", "image", "photo", "icon", "아이콘"], "filenamePattern": "\\.(png|jpe?g|gif|svg|webp)$" }

// assets/sources.json
{ "sources": [ { "id": "kwcag22-a11ykr", "title": "KWCAG 2.2 비공식 HTML판", "url": "https://a11ykr.github.io/kwcag22/", "accessedOn": "2026-09-04", "status": "ok", "license": "원문 저작권 국립전파연구원(방송통신표준), 비공식 변환" } ] }
```

## 6. 규칙 엔진 인터페이스

```ts
type Automation = "auto" | "assist" | "manual" | "na";
interface RuleMeta { id: string; kwcag: string; wcag: string[]; engine: "k" | "b"; impact: Impact; confidence: Confidence; tier: "T1" | "T2" | "B"; }
interface StaticContext { document: Document; window: DOMWindow; html: string; baseUrl?: string; data: DataBundle; }
interface BrowserContext { page: Page; data: DataBundle; viewport: "desktop" | "mobile"; }
interface StaticRule extends RuleMeta { engine: "k"; run(ctx: StaticContext): Finding[]; }
interface BrowserRule extends RuleMeta { engine: "b"; run(ctx: BrowserContext): Promise<Finding[]>; }
```

- 규칙은 예외를 던지지 않도록 작성하되, 엔진은 규칙별 try/catch로 격리하고 실패한 규칙 ID를 `notices`에 남긴다(한 규칙 오류가 리포트를 막지 않음).
- `registry.ts`가 규칙 목록·검사항목 귀속을 단일 소스 데이터와 대조한다(존재하지 않는 검사항목 귀속 시 기동 중단).

## 7. WBS·마일스톤

[06-harness-engineering.md](06-harness-engineering.md) §5 표 참조(레인 배정 포함).
