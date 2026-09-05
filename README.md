# SWWA — 웹 접근성(KWCAG 2.2) Skill + MCP

국가표준 **KWCAG 2.2**(한국형 웹 콘텐츠 접근성 지침, 4원칙·14지침·33개 검사항목)와 **웹 접근성 품질인증** 기준으로 웹 콘텐츠의 접근성을 검사·리뷰·인증 준비하도록 돕는 Claude Code 플러그인(스킬 3종)과 MCP 서버(npm `swwa-mcp`)입니다.

> 판정·측정·지식은 서버(결정적·오프라인)가, 해석·수정안·보고서는 클라이언트 LLM이. 도구의 자동 판정은 전문가·사용자 심사를 대체하지 않습니다.

## 설치

```bash
# Claude Code 플러그인 (스킬 3종 포함, 권장)
/plugin marketplace add SWJoong/SWWA
/plugin install swwa@swwa

# 또는 MCP 서버만
claude mcp add swwa -- npx -y swwa-mcp   # Claude Code
npx -y swwa-mcp                          # 다른 MCP 클라이언트
```

자세한 설치·첫 사용: [docs/install/](docs/install/) ([Claude Code](docs/install/claude-code.md) · [Claude Desktop](docs/install/claude-desktop.md) · [처음 사용해보기](docs/install/first-use.md)).

## 구성

| 구성 | 내용 |
|---|---|
| 스킬 `kwcag-guide` | KWCAG 2.2 33개 검사항목·WCAG 2.2 매핑·품질인증 기준·모바일 앱 지침 2.0 요약 (도메인 지식) |
| 스킬 `a11y-review` | HTML·JSX·Vue·Svelte·CSS를 검사항목 ID 기준으로 리뷰하고 수정안 제시 |
| 스킬 `a11y-audit` | URL을 실제 브라우저로 감사해 33항목 판정표·보고서·인증 준비도 산출 |
| MCP 도구 7종 | `check_html` · `check_contrast` · `lookup_checkpoint` · `get_checklist` · `audit_url` · `browser_status` · `estimate_cert_readiness` |
| MCP 프롬프트·리소스 | `review-markup` · `audit-report` / `swwa://kwcag22` 등 6종 |

- 정적 검사(jsdom + axe-core 한국어 로케일 + 자체 `k-` 규칙 18종)는 브라우저 없이 동작합니다.
- 브라우저 감사(playwright-core + @axe-core/playwright + 자체 `b-` 규칙 6종)는 설치된 Chrome/Edge를 자동 사용하며, 없으면 `npx playwright install chromium`을 안내합니다.

## 문서

- [CHANGELOG.md](CHANGELOG.md) — 버전별 변경
- [docs/plan/00-overview.md](docs/plan/00-overview.md) — 총괄·기술 스택·로드맵
- [docs/plan/02-architecture.md](docs/plan/02-architecture.md) — MCP 인터페이스 명세(계약)·Report 스키마·데이터 모델
- [skills/kwcag-guide/references/kwcag22-checklist.md](skills/kwcag-guide/references/kwcag22-checklist.md) — 검사항목 33개 단일 소스(규칙 카탈로그)
- [docs/plan/07-references.md](docs/plan/07-references.md) — 레퍼런스 조사 결과

## 출처·저작권

KWCAG 2.2 원문 저작권은 국립전파연구원(방송통신표준)에 있으며, 이 프로젝트는 검사항목 명칭·요구 문장만 인용하고 설명은 자체 요약합니다. axe-core(MPL-2.0)를 검사 엔진으로 사용합니다. 자세한 출처는 `docs/plan/07-references.md`와 `assets/sources.json`을 참조하세요.

> 자동 판정 수치 중 품질인증 기준(전문가 95%·사용자 100%·평균 90)과 일부 법령 조항은 인증기관 공지로 재확인이 필요한 잠정치입니다.

## 라이선스

MIT — [LICENSE](LICENSE)
