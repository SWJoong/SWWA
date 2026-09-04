# 03. Backend 구현 계획

> 계약: [02-architecture.md](02-architecture.md) §3~§6 · 규칙 목록: [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md) · 레인: U(구현·배포)

## 1. 저장소 구조 (플러그인 루트 = 저장소 루트)

```
SWWA/
├── .claude-plugin/plugin.json          # name "swwa" → 스킬은 /swwa:a11y-audit 등
├── .claude-plugin/marketplace.json     # /plugin marketplace add SWJoong/SWWA 용(source "./")
├── .mcp.json                           # {"mcpServers":{"swwa":{"command":"node","args":["${CLAUDE_PLUGIN_ROOT}/bin/swwa-mcp.mjs"]}}}
├── bin/swwa-mcp.mjs                    # 런처(커밋): ../dist/index.js 있으면 로컬 실행, 없으면 npx -y swwa-mcp 실행
├── skills/
│   ├── kwcag-guide/   SKILL.md · references/{kwcag22-checklist.md, wcag-mapping.md, certification.md, mobile-app-guideline.md, glossary.md, sources.md}   ← W 레인
│   ├── a11y-review/   SKILL.md · references/{html.md, react-jsx.md, vue-svelte.md, css.md, forms.md, tables.md, media.md, aria-widgets.md, korean-pitfalls.md}
│   └── a11y-audit/    SKILL.md · references/{audit-flow.md, page-sampling.md, report-template.md, user-eval-checklist.md}
├── src/
│   ├── index.ts · server.ts · messages.ts · schema-dialect.ts(EASYREAD 복사)
│   ├── data/      kwcag22.ts · wcag22.ts · axe-map.ts · certification.ts · wordlists.ts · loader.ts(zod 스키마·경로 해석)
│   ├── engine/    static.ts · browser.ts · browser-detect.ts · url-guard.ts
│   ├── rules/     types.ts · registry.ts · k/{k-*.ts, index.ts} · b/{b-*.ts, index.ts} · util/{selector.ts, text.ts, focusable.ts}
│   ├── normalize/ finding.ts · axe.ts · checkpoints.ts · locale.ts
│   ├── report/    types.ts · summarize.ts · cert.ts · format.ts(한국어 텍스트 요약)
│   ├── tools/     check-html.ts · check-contrast.ts · lookup.ts · checklist.ts · audit-url.ts · browser-status.ts · cert-readiness.ts
│   ├── prompts/   review-markup.ts · audit-report.ts
│   ├── resources/ index.ts
│   └── color/     contrast.ts(CSS 색 파싱·상대 휘도·알파 합성)
├── assets/  kwcag22.json · wcag22.json · axe-rule-map.json · certification.json · link-text-ko.json · alt-text-ko.json · mobile-app-2.0.md · sources.json
├── tests/   (W 레인 — 04-qa-plan.md)
├── scripts/ agent-sync.sh · validate-assets.mjs · serve-fixtures.mjs
├── docs/    plan/00~07 · install/{claude-code,claude-desktop,first-use}.md · CLAUDE-INSTANCE-{W,U}.md
├── .github/workflows/ ci.yml · browser.yml · cross-platform.yml · release.yml
├── CLAUDE.md · README.md · LICENSE · CHANGELOG.md · SECURITY.md · .gitignore
└── package.json · tsconfig.json · tsconfig.build.json · eslint.config.js · vitest.config.ts
```

## 2. package.json · 의존성 (2026-09-04 최신 확인)

- `name: "swwa-mcp"`, `type: "module"`, `bin: { "swwa-mcp": "dist/index.js" }`, `files: ["dist", "assets", "bin", "README.md", "LICENSE"]`, `engines: { node: ">=22" }`, `publishConfig: { access: "public", provenance: true }`.
- dependencies: `@modelcontextprotocol/sdk ^1.30.0` · `zod ^4` · `axe-core ~4.13.0` · `@axe-core/playwright ~4.13.0` · `jsdom ^30` · `playwright-core ^1.62` · `parse5 ^8`.
- devDependencies: `playwright ^1.62`(브라우저 테스트·CI 설치 전용) · `typescript ~6.0` · `vitest ^5` · `eslint ^10` · `@eslint/js` · `typescript-eslint` · `tsx` · `@types/node ^22` · `@types/jsdom`.
- scripts: `build`(tsc -p tsconfig.build.json) · `dev`(tsx watch src/index.ts) · `start` · `typecheck` · `lint` · `lint:fix` · `test`(vitest run --exclude tests/browser) · `test:browser`(vitest run tests/browser) · `inspector`(npx @modelcontextprotocol/inspector node dist/index.js) · `check`(lint && typecheck && build && test && node scripts/validate-assets.mjs) · `prepublishOnly`(npm run build).
- 런타임 의존성이 EASYREAD(2개)보다 많다(7개). 공급망 최소화 원칙은 "검사 엔진에 꼭 필요한 것만"으로 완화하고 `npm audit`을 CI 게이트에 포함한다.

## 3. 엔트리·서버 조립 (EASYREAD 패턴 그대로)

- `src/index.ts`: 데이터 로드 → `createServer(data)` → `StdioServerTransport`. stdout 금지, 실패 시 stderr + exit 1.
- `src/server.ts`: `new McpServer({ name: "swwa", version })` → `normalizeToolSchemaDialect(server)`(EASYREAD `schema-dialect.ts` — SDK 1.30이 draft-07 `$schema`를 방출하는 문제 우회, **도구 등록 전 호출**) → 도구 7·프롬프트 2·리소스 6 등록. 로직 없음.
- `src/messages.ts`: 사용자 대면 문자열(규칙 메시지·fix 안내·notices·오류 문구) 집중.
- `bin/swwa-mcp.mjs`(런처):
  ```js
  // dist가 있으면 로컬 개발 빌드, 없으면 게시본. Windows에서 .mcp.json의 npx 직접 실행 문제 회피.
  import { existsSync } from "node:fs"; import { spawn } from "node:child_process"; import { fileURLToPath } from "node:url";
  const dist = fileURLToPath(new URL("../dist/index.js", import.meta.url));
  if (existsSync(dist)) { await import(dist); }
  else { const c = spawn("npx", ["-y", "swwa-mcp"], { stdio: "inherit", shell: true }); c.on("exit", (code) => process.exit(code ?? 1)); }
  ```

## 4. 데이터 로더 (`src/data`)

- zod 스키마는 `src/data`에만 정의(단일 정의). `loadKwcag22()`·`loadWcag22()`·`loadAxeMap()`·`loadCertification()`·`loadWordlists()` → `DataBundle`.
- 경로: `new URL("../../assets/…", import.meta.url)`(dist 기준). `scripts/validate-assets.mjs`는 EASYREAD처럼 **dist 로더를 재사용**해 CI·릴리스 게이트로 동작하며 추가로 (a) 33건·ID 중복 없음 (b) 모든 A/AA SC가 `kwcagIds` 필드를 가짐 (c) `axeRules`가 `axe.getRules()`에 존재 (d) md 단일 소스와 ID·명칭·WCAG·등급 동일을 검사한다.
- `registry.ts` 기동 시 규칙의 `kwcag` 귀속이 데이터에 존재하는지 검증(불일치 → 기동 중단).

## 5. 정적 엔진 (`engine/static.ts`)

```ts
const dom = new JSDOM(html, { url: baseUrl ?? "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true });
// 페이지 <script>는 실행하지 않고(outside-only), axe만 주입한다.
dom.window.eval(axeSource);                 // axe-core의 `axe.source`
const axe = dom.window.axe;
axe.configure({ locale: koLocale });        // axe-core/locales/ko.json (정규화 단계 치환과 중복돼도 무해)
const result = await axe.run(dom.window.document, {
  runOnly: { type: "tag", values: TAGS[ruleset] },
  rules: Object.fromEntries([...STATIC_DISABLED_RULES, ...excludeRules].map((id) => [id, { enabled: false }])),
  resultTypes: ["violations", "incomplete", "passes"],
});
const kFindings = runStaticRules(rules.k, { document, window, html, baseUrl, data });
```

- `parse5.parse(html, { onParseError })`로 마크업 오류를 수집해 `k-parse-errors`에 전달(닫힘·중첩·중복 속성 코드 화이트리스트만 보고, `non-void-html-element-start-tag-with-trailing-solidus` 등 무해 코드는 제외).
- 크기 상한 2MB, 규칙별 try/catch, 전체 타임아웃 10초(초과 시 `E_TIMEOUT`).
- `STATIC_DISABLED_RULES`는 [02](02-architecture.md) §3.1 목록을 `axe-rule-map.json`의 `staticDisabled`와 동기.

### 5.1 알려진 한계 — 대용량 문서 성능 (T-06, 2026-09-05)

`axe.run()`의 `resultTypes`에 `"passes"`를 포함하면 axe-core가 모든 통과 사례까지 리포트하느라
문서 크기에 따라 수십 배 느려진다는 것을 확인했다(500행 표 기준 <1초 → 50초 이상). **이 프로젝트는
`resultTypes: ["violations", "incomplete"]`만 요청**하도록 고쳐 이 문제는 해결했다(checkpoint 상태
계산은 단일 소스의 `axeRules` 목록으로 "실행 가능 여부"를 판단하므로 axe의 실제 `passes` 결과가
애초에 필요 없다).

다만 그 이후에도 **axe-core를 jsdom 위에서 실행하는 것 자체가 실제 브라우저보다 훨씬 느리다**
(접근 가능한 이름 계산·`getComputedStyle` 등이 jsdom에서 비용이 크다). 실측:

| 문서 형태 | 크기 | 소요 시간 |
|---|---|---|
| 일반 컴포넌트/페이지(FR-01 주 사용 사례) | 수 KB | ~0.2초 |
| 카드 목록형 페이지(article×h2×p×img×a) | 50KB | ~3초 |
| 〃 | 100KB | ~18초 |
| 〃 | 200KB+ | 25초 이상(타임아웃) |

**완료 기준 "500KB ≤ 2초"는 현재 구현으로 충족하지 못한다.** 또한 axe-core의 규칙 평가가 충분히 긴
구간 동안 동기적으로 실행되는 경우가 있어, `engine/static.ts`의 10초 타임아웃(`Promise.race`)이
그 구간 동안은 선점하지 못할 수 있다 — 극단적으로 큰/조밀한 입력에서는 서버가 응답 없이 오래
멈출 위험이 남아 있다.

**후속 조치가 필요하다(백로그)**:
1. `worker_threads`로 정적 엔진을 분리해 실제로 강제 종료 가능한 타임아웃 구현
2. 페이지 규모에 따라 axe 규칙 서브셋을 더 줄이거나 단계적으로 실행하는 방안 검토
3. 완료 기준 자체("500KB ≤ 2초")를 실측 근거로 재조정할지 검토(일반 사용 사례는 이미 충분히 빠름)

일반적인 사용(컴포넌트·페이지 단위 검사, 수백 KB 미만)은 문제 없이 빠르다 — 이 한계는 대용량 페이지
전체를 한 번에 검사하는 시나리오(예: `audit_site` 백로그, 대형 목록 페이지)에서만 나타난다.

## 6. 브라우저 엔진 (`engine/browser.ts`, `browser-detect.ts`)

- 채널 탐지(프로세스 캐시): `chromium.launch({ channel: "chrome", headless: true })` → 실패 시 `"msedge"` → 실패 시 `chromium.launch()`(사용자가 `playwright` 브라우저를 설치한 경우) → 모두 실패 시 `E_NO_BROWSER` + `installHint`("Chrome/Edge를 설치하거나 `npx playwright install chromium`").
- 컨텍스트: 임시 프로필(persistent context 미사용), `viewport`·`isMobile`·`hasTouch`(mobile), `extraHTTPHeaders`(headers), `ignoreHTTPSErrors: false`.
- axe: `new AxeBuilder({ page }).withTags(TAGS[ruleset]).disableRules(excludeRules).options({ resultTypes: [...] }).analyze()` — experimental 규칙 `label-content-name-mismatch`는 `.withRules([...])` 추가 실행.
- b-규칙: `page.evaluate`로 DOM 측정 + `page.keyboard.press("Tab")` 순회(최대 200 정지점, 첫 요소로 되돌아오면 종료). 규칙별 타임아웃 10초.
- `url-guard.ts`: 스킴 http/https/file만, 호스트가 `169.254.0.0/16`·`metadata.google.internal`·`fd00::/8` 등 메타데이터 계열이면 `E_BLOCKED_URL`. localhost·사설 IP는 허용(로컬 개발 서버 감사가 1차 시나리오).
- 종료: 도구 호출마다 브라우저 launch/close(단순·안전). 성능이 문제 되면 idle 60초 재사용으로 개선(백로그).

## 7. 규칙 구현 규약 (`rules/k`, `rules/b`)

- 파일 1개 = 규칙 1개, 파일명 = 규칙 ID(`k-skip-link-first.ts`). `export const rule: StaticRule = { id, kwcag, wcag, engine: "k", impact, confidence, tier, run }`.
- `run`은 순수 함수. DOM 탐색은 `rules/util`(셀렉터 생성 `cssPath(el)`, 초점 가능 요소 판별 `isFocusable`, 텍스트 정규화 `normText`)만 사용.
- Finding 생성은 `normalize/finding.ts`의 `createFinding(rule, el, { message, fix, outcome, confidence })`로만 — 메시지 키는 `messages.ts`.
- k-규칙 우선순위: **T1 18개**(M2) → T2(M3, 가능한 만큼) → B 6개(M3). 목록·의도는 단일 소스 표 참조. 구현 메모:
  - `k-skip-link-first`: 문서 순서상 첫 초점 가능 요소가 같은 문서 내 `#` 링크인지. 텍스트 사전(본문 바로가기·메뉴 건너뛰기·skip)은 힌트일 뿐 판정 근거는 "첫 초점 + 문서 내 앵커".
  - `k-skip-target-exists`: 위 링크의 대상 id/name 존재 여부.
  - `k-title-generic`: `<title>` 빈 값·`Untitled`·`제목 없음`·사이트명만(콜론·대시 없이 3어절 이하) → confidence medium.
  - `k-link-text-generic`: `link-text-ko.json` 사전과 정확·접두 일치(공백·기호 정규화). `aria-label`·`title`이 보완하면 pass.
  - `k-new-window-notice`: `target="_blank"`인데 텍스트·`title`·`aria-label`·인접 이미지 alt에 "새 창/새창/새 탭/new window" 없음.
  - `k-lang-ko-expected`: 본문 텍스트 중 한글 비율 ≥ 30%인데 `html[lang]`이 `ko*`가 아님(경고, confidence medium).
  - `k-parse-errors`: parse5 오류 코드 화이트리스트 → 8.1.1(4.1.1) fail, 위치(line·col)를 `selector` 대신 `location`으로.
  - 나머지 T1: 단일 소스 표의 설명대로.
- b-규칙(`rules/b`): `b-focus-visible`(초점 전후 `outline`·`box-shadow`·`border`·`background` 계산 스타일 비교), `b-focus-order`(Tab 순서 vs DOM 순서 역행 감지), `b-skip-link-works`(첫 Tab → Enter → `activeElement`/스크롤 대상 이동), `b-target-size-6mm`(대화형 요소 `getBoundingClientRect` 대각선 < 6mm ≈ 22.7px@96dpi, 인라인 텍스트 링크 예외, `dpi` 옵션), `b-keyboard-reachable`(onclick/role 대화형인데 Tab 순회에 없음), `b-motion-runtime`(MutationObserver 5초 관찰 중 자동 변경 + 정지 컨트롤 텍스트 없음).

## 8. 정규화·리포트 (`normalize`, `report`)

- `normalize/axe.ts`: `violations`(outcome fail, confidence high)·`incomplete`(outcome incomplete, confidence medium) → Finding. `nodes[].target[0]`→selector, `nodes[].html`→html(300자 절단), `help`/`description`은 `locale.ts`가 ko.json으로 치환.
- `normalize/checkpoints.ts`: 규칙→검사항목 귀속(자동 매핑 + 오버라이드) 후 33항목 status 계산([02](02-architecture.md) §4 규칙). 항상 단일 소스 순서로 33개.
- `report/summarize.ts`: verdict·summary·truncate. `report/cert.ts`: 다중 Report 집계·준수율·gaps. `report/format.ts`: `content`용 한국어 요약(판정 → 항목별 fail/incomplete → 상위 10개 Finding → 수동 확인 안내 → notices).

## 9. 오류·로깅 규약

- 로그는 `console.error`만, 접두 `[swwa]`. 입력 HTML·URL의 쿼리·헤더 값·페이지 텍스트는 로그에 남기지 않는다.
- 도구 응답 오류는 `{ isError: true, content: [{ type: "text", text: 한국어 안내 }], structuredContent: { code: "E_…" } }`. 스택·본문 미포함.
- 브라우저 프로세스는 finally에서 항상 close, 실패 시 stderr 경고만.

## 10. 구현 순서 (U 레인, WBS)

T-02 스캐폴드 → T-04 데이터·조회 도구(`lookup_checkpoint`, `get_checklist`, 리소스) → T-06 정적 엔진·T1 규칙·`check_html`·`check_contrast` → T-07 브라우저 엔진·b-규칙·`audit_url`·`browser_status` → T-09 `estimate_cert_readiness`·프롬프트·T2 규칙 → T-10 스킬(a11y-review·a11y-audit) → T-12 배포. 각 단계는 W의 선행 테스트(T-03·T-05·T-08·T-11)를 초록으로 만드는 것이 완료 기준이다.
