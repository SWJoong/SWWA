# Claude Desktop에 SWWA 설치하기

Claude Desktop 앱에서 SWWA(웹 접근성 검사)를 쓰는 방법입니다.

## 먼저 준비할 것
- **Node.js 22 버전 이상**이 필요합니다.
- 인터넷은 설치할 때만 필요합니다. 정적 검사·지식 조회는 인터넷이 없어도 됩니다(`audit_url`은 대상 URL에 접근).

## 설치 순서

### 1. 설정 파일을 엽니다
`claude_desktop_config.json`:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

파일이 없으면 새로 만듭니다.

### 2. 아래 내용을 넣습니다

**macOS / Linux**
```json
{
  "mcpServers": {
    "swwa": { "command": "npx", "args": ["-y", "swwa-mcp"] }
  }
}
```

**Windows**
```json
{
  "mcpServers": {
    "swwa": { "command": "cmd", "args": ["/c", "npx", "-y", "swwa-mcp"] }
  }
}
```

이미 다른 서버가 있으면 `mcpServers` 안에 `swwa` 부분만 더합니다.

### 3. 앱을 다시 시작합니다
Claude Desktop을 완전히 끄고 다시 켭니다.

### 4. 확인
입력창 근처 도구 아이콘에 `swwa` 도구들이 보이면 성공입니다. 이제 "이 HTML 접근성 검토해줘"처럼
부탁하면 됩니다. → [처음 사용해보기](first-use.md)

## 잘 안 될 때
1. **Node 버전** — `node -v`가 22 이상인지 확인.
2. **로그** — Claude Desktop 로그에서 `swwa` 줄을 확인.
3. **터미널에선 되는데 앱에서만 안 될 때(특히 Linux·nvm).** 앱이 다른 node로 서버를 켜는 경우입니다.
   node 22가 켜진 터미널에서 `which npx`로 절대경로를 확인해 아래처럼 넣습니다(경로·HOME은 본인 환경에 맞게).
   ```json
   {
     "mcpServers": {
       "swwa": {
         "command": "/home/사용자/.nvm/versions/node/v22.23.2/bin/npx",
         "args": ["-y", "swwa-mcp"],
         "env": {
           "PATH": "/home/사용자/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin",
           "HOME": "/home/사용자"
         }
       }
     }
   }
   ```
