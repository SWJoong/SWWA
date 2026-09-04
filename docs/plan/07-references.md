# 07. 레퍼런스 조사 결과와 반영 (2026-09-04)

> 조사 도구: WebFetch·WebSearch·npm view·GitHub. 접속 실패한 출처는 상태를 남겼다. 데이터화 시 `assets/sources.json`에 확인일·상태·라이선스 메모를 옮긴다.

## 1. 국내 지침·인증 (사용자 제공 URL 포함)

| 출처 | 접근 | 확인한 것 | 반영 |
|---|---|---|---|
| http://www.kwacc.or.kr/WAI/wcag21/ (한국디지털접근성진흥원, KWCAG 2.1) | ✗ ECONNRESET | — | 웹소울랩 2.1 페이지로 대체 |
| http://www.kwacc.or.kr/Accessibility/Certification (품질인증 소개) | ✗ ECONNRESET(재시도 포함) | 검색 결과로 확인: 디지털포용법 제21조·시행령(조 번호 출처마다 17/20조로 상이), KWCAG 2.2 33항목, **전문가 심사 준수율 95% 이상 + 사용자 심사(장애유형별 과업) 성공률 100%, 두 심사 평균 90점 이상** | `certification.json`(`needsVerification`·`verifiedOn`·`sourceUrl`), `estimate_cert_readiness` notices |
| https://accessibility.naver.com/mobile/accessibility/ (네이버 모바일 접근성) | ✗ 도구 접근 차단 | NULI(`nuli.navercorp.com`)에 모바일 앱 체크리스트·직군별 교육 존재(체크리스트 페이지는 인증서 오류) | `mobile-app-guideline.md` 참고 URL, 수동 열람 권장 |
| https://www.websoul.co.kr/accessibility/WA_guide21.asp (KWCAG 2.1) | ✓ | 24항목 체계(1.x~4.x 별칭 번호), 2.2·2.0·모바일 앱 지침 링크 | `wcag-mapping.md` 2.1↔2.2 대응표 |
| https://websoul.co.kr/accessibility/WA_guide22.asp (KWCAG 2.2) | ✓ | 33항목 요구 문장 한 줄씩, 임계값(명도 대비 4.5:1, 깜빡임 3~50Hz) | 단일 소스 §3 요구 문장 표 |
| https://webwatch.or.kr:50010/WA/010201.html?MenuCD=120 (웹와치 인증 소개) | ✓(개요만) | 디지털포용법 제21조·시행령 제17조 언급, 인증 절차·기준·수수료·FAQ 하위 페이지(`010301`은 500) | `certification.md` 기관·링크 |
| https://www.w3.org/WAI/fundamentals/accessibility-intro/ko (W3C WAI 소개) | ✓ | 정의·장애 유형·상황·용어(웹 접근성·보조기술·대체 텍스트·녹취록), WCAG 2.0=ISO/IEC 40500 | `glossary.md` |
| https://a11ykr.github.io/kwcag22/ (KWCAG 2.2 비공식 HTML판, GitHub `a11ykr/kwcag22`) | ✓ | 33항목 전문(표준 본문 5~8장 번호), 신규 9항목, 원문 저작권 국립전파연구원(방송통신표준) | `kwcag22.json` 원문 대조, 공식 번호 체계 |
| https://a11ykr.github.io/docs/wcag2/ (WCAG 2.2 비공식 한국어 번역, GitHub `a11ykr/docs`) | ✓ | 성공기준 한국어 명칭 전체, W3C 문서 라이선스, 비공식 고지 | `wcag22.json.name_ko`(출처 표기) |
| https://nia-a11y.github.io/kwcag22tech/ (NIA 「웹 접근성을 고려한 콘텐츠 제작기법 2.2」) | ✓(목차) | 검사항목별 제작 기법·실무 적용, 저작권 NIA | 자체 요약만·URL 참조(NFR-04) |
| 웹와치 「웹 접근성 지침 해설서(KWCAG 2.2 기준)」·「KWCAG 2.1/2.2 검사항목 대조표」 PDF | △(게시판 500 / PDF 링크만) | 검사항목별 해설·대조표 | 수동 열람 후 요약 반영 |
| 모바일 애플리케이션 콘텐츠 접근성 지침 2.0 (국립전파연구원, KS X 3253 / TTAK.KO-10.0634) | △(보도자료·PDF 링크) | 4원칙·18지침(인식 6·운용 5·이해 5·견고 3) | `mobile-app-guideline.md` 요약 |
| OpenWAX (`goonoo/OpenWAX`, N-WAX 후신, KWCAG 2.0 기반) | ✓ | 검사 항목: 대체 텍스트·데이터 표·단축키·언어·초점·제목·프레임 제목·헤딩·본문 바로가기·링크 텍스트·레이블·마크업 | 자체 k-규칙 후보 목록. 코드 복사 없음(라이선스 미확인) |
| KWCAG A11y Inspector (Chrome 확장) | △(스토어 설명) | 2.1.3 조작 가능 **6mm 대각선**, WCAG 2.5.8 24×24px, 명도 대비 | `b-target-size-6mm` 설계 |

## 2. GitHub 오픈소스 — MCP 서버

| 저장소 | 핵심 | 채택 | 기각 |
|---|---|---|---|
| `JustasMonkev/mcp-accessibility-scanner` (MIT, npx·Docker) | Playwright+axe, 40+ 도구, `audit_keyboard`(Tab 순회·초점 가시성·트랩·타깃 크기·초점 가림), `audit_screen_reader`(접근성 트리), 주석 스크린샷, viewport 매트릭스, 세션 유지 | 키보드·초점 b-규칙 설계, `audit_url.checks` 옵션, 주석 스크린샷(백로그) | 브라우저 자동화 도구 40개(범위 과다, chrome-devtools MCP 존재) |
| `Duds/accessibility-mcp` (MIT) | axe+Lighthouse+WAVE 3엔진, **정규화 스키마**(ruleId·WCAG·severity·confidence·outcome·selector), 결정성 강조 | Finding의 `confidence`·`outcome`, 결정성 | Lighthouse·WAVE(외부 CLI·API 키) |
| `ronantakizawa/a11ymcp` (MIT, 10k+ 다운로드) | Puppeteer+axe, `test_html_string`, `check_color_contrast`, `get_rules`, `check_aria_attributes`, npx 설치 | HTML 문자열 입력, 대비 도구, npx 경로 | Puppeteer(브라우저 동봉) |
| `jbuchan/accessibility-mcp-server` (MIT) | Playwright 3브라우저, WCAG 버전·레벨 선택, 사설 IP 차단, 결과 파일 저장·조회 | 메타데이터 호스트 차단·타임아웃, `outputDir` | 3브라우저(chromium만), 결과 파일 조회 도구 |
| `PashaBoiko/playwright-axe-mcp`, `CalvHobbes/a11y-mcp` | 유사 구조 | — | — |

## 3. GitHub 오픈소스 — Claude 스킬·플러그인

| 저장소 | 핵심 | 채택 |
|---|---|---|
| `masuP9/a11y-specialist-skills` (MIT, 플러그인·Codex 호환) | 스킬 4종(reviewing-a11y·auditing-wcag·planning-wcag-audit·planning-a11y-improvement), **4단계 감사(자동→상호작용→수동→콘텐츠)**, `packages/a11y-audit` npm 별도 배포 | 감사 흐름(`a11y-audit`), 플러그인+npm 이중 배포, 마켓플레이스 설치 |
| `joedevon/a11y-skills` (MIT, GAAD 공동창립자) | 스킬 7종, `a11y-code-review`에 18개 전문 레퍼런스(ARIA·폼·키보드·대비·표·모달·라이브 리전·링크·alt·차트·이메일·미디어·웹 컴포넌트), HTML/JSX/Vue/Svelte/Astro/CSS/Tailwind | `a11y-review/references/` 분할 방식 |
| `mrKanoh/claude-wcag-accessibility-skill` (MIT) | SKILL.md 28섹션, CSV DB 15종(WCAG·ARIA 패턴·도구·스크린리더 단축키·법령…), `search.py`, 자체 MCP, 템플릿(감사 보고서·CI·VPAT), 예제 컴포넌트 7종 | 데이터=구조화 파일 + 조회 도구(우리는 JSON+TS), 보고서 템플릿 |
| `zivtech/a11y-meta-skills` | 8단계 개발 사이클 스킬 번들 | 단계별 체크리스트 아이디어 |
| `airowe/claude-a11y-skill` | axe(브라우저) + eslint-plugin-jsx-a11y(빠른 CI) | JSX는 정적 변환 한계 고지·렌더 HTML 권장(백로그: jsx-a11y 연계) |
| `mgifford/accessibility-skills`, `accesslint/claude-marketplace` | 스킬 모음 | 참고 |

## 4. 라이브러리·플랫폼 (npm view 2026-09-04)

| 항목 | 버전·사실 | 반영 |
|---|---|---|
| `axe-core` 4.13.0 (MPL-2.0) | `locales/ko.json` 존재(da·de·el·es·eu·fr·he·it·ja·**ko**·nb·nl·pl·pt_BR·pt_PT·ru·sv·zh_CN·zh_TW), 규칙 태그 `wcag2a/2aa/21a/21aa/22aa`·`wcagXYZ`·`best-practice`·`experimental`, `axe.source`로 jsdom 주입 | ADR-07, 정적 엔진 |
| `@axe-core/playwright` 4.13.0 | peer `playwright-core >= 1.0`, `axe-core ~4.13.0` | 브라우저 엔진 |
| `playwright` / `playwright-core` 1.62.1 | `channel: "chrome" | "msedge"` 지원 | ADR-03 채널 탐지 |
| `jsdom` 30.0.1 (`parse5 ^8.0.1` 동봉), `parse5` 8.0.1 | `runScripts: "outside-only"`, `onParseError` | 정적 엔진, `k-parse-errors` |
| `@modelcontextprotocol/sdk` 1.30.0(latest) / 2.0.0-alpha | `registerTool(inputSchema·outputSchema·annotations)`, `registerResource`, `ResourceTemplate`, `registerPrompt`, `InMemoryTransport` | SDK 1.x 고정, EASYREAD `schema-dialect.ts` 유지 |
| `zod` 4.5.4 · `vitest` 5.0.0 · `typescript` 7.0.2 · `eslint` 10 | EASYREAD는 TS ~6.0.3 | TS ~6.0으로 시작(R-09) |
| npm 이름 | `swwa-mcp`·`swwa`·`kwcag-mcp`·`@swjoong/swwa-mcp` 모두 미등록(E404) | `swwa-mcp` 채택 |
| Claude Code 문서(`code.claude.com/docs/en/skills`·`/plugins`) | SKILL.md 프런트매터: `name·description·when_to_use·argument-hint·arguments·disable-model-invocation·user-invocable·allowed-tools·disallowed-tools·model·effort·context·agent·background·hooks·paths·shell·metadata·license·compatibility`(description+when_to_use 1,536자 상한) · 플러그인: `.claude-plugin/plugin.json`, `skills/`, `agents/`, `hooks/`, `.mcp.json`(`${CLAUDE_PLUGIN_ROOT}`), `bin/`, `claude plugin validate`, `claude plugin init`, `--plugin-dir`, `/reload-plugins`, 커뮤니티 마켓플레이스 제출 | §8 스킬·§12 배포 |

## 5. 사용자 제공 URL 목록 (원본)

- http://www.kwacc.or.kr/WAI/wcag21/
- http://www.kwacc.or.kr/Accessibility/Certification
- https://accessibility.naver.com/mobile/accessibility/
- https://www.websoul.co.kr/accessibility/WA_guide21.asp
- https://webwatch.or.kr:50010/WA/010201.html?MenuCD=120
- https://www.w3.org/WAI/fundamentals/accessibility-intro/ko
