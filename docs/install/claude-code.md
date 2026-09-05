# Claude Code에 SWWA 설치하기

Claude Code(터미널)에서 SWWA(웹 접근성 검사)를 쓰는 방법입니다.

## 먼저 준비할 것
- **Node.js 22 버전 이상**이 필요합니다.
- 브라우저 감사(`audit_url`)를 쓰려면 Chrome 또는 Edge가 있으면 됩니다. 없어도 정적 검사(`check_html`)는 동작합니다.

## 방법 A — 플러그인으로 설치 (권장, 스킬 3종 포함)

```bash
/plugin marketplace add SWJoong/SWWA
/plugin install swwa@swwa
```

설치 후 `/help`에 스킬 3종(`a11y-review`·`a11y-audit`·`kwcag-guide`)이, `/mcp`에 `swwa` 도구 7개가
보이면 성공입니다.

## 방법 B — MCP 서버만 등록

```bash
claude mcp add swwa -- npx -y swwa-mcp
claude mcp list   # 목록에 swwa가 있으면 성공
```

## 처음 사용
"이 HTML 접근성 검토해줘"처럼 코드와 함께 부탁하거나, "KWCAG 6.4.1이 뭐야?"처럼 물어봅니다.
자세한 예시는 [처음 사용해보기](first-use.md).

## 브라우저 감사 준비 (선택)
`audit_url`은 실제 브라우저가 필요합니다. Chrome/Edge가 없으면:
```bash
npx playwright install chromium
```
먼저 `browser_status` 도구로 가용성을 확인할 수 있습니다.

## 잘 안 될 때
1. **Node 버전** — `node -v`가 22 이상인지 확인.
2. **인터넷** — 정적 검사·지식 조회는 인터넷이 필요 없습니다. `audit_url`은 검사 대상 URL에만 접근합니다.
3. **다시 등록** — `claude mcp remove swwa` 후 다시 추가.
4. **플러그인 문제** — `claude plugin validate .`(개발 시) 또는 `/plugin` 메뉴에서 상태 확인.
