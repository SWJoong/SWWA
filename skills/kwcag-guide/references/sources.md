# 출처·확인일·라이선스 메모

> `assets/sources.json`(§5 데이터 모델)의 사람이 읽는 버전. 원문 전재 금지(NFR-04) — 명칭·요구
> 문장 한 줄 인용 + 자체 요약 + 출처 표기만 한다. 이 문서 자체도 표준 해설을 재작성한 것이며
> 원문을 옮기지 않는다.

| ID | 제목 | URL | 확인일 | 상태 | 라이선스·주의 |
|---|---|---|---|---|---|
| `kwcag22-official` | 한국형 웹 콘텐츠 접근성 지침 2.2 (KS X OT0003) | 국립전파연구원 국가표준(공식 고시문, 별도 상시 URL 없음 — 국가표준인증통합정보시스템(e-나라표준인증) 검색 필요) | 2026-09-04 | `needsVerification`(공식 고시 URL 특정 필요) | 원문 저작권 국립전파연구원(국가표준). 요구 문장 한 줄 인용만 허용 |
| `kwcag22-a11ykr` | KWCAG 2.2 비공식 HTML판 | https://a11ykr.github.io/kwcag22/ | 2026-09-04 | ok | 비공식 변환본. 원문 저작권은 국립전파연구원, 이 사이트는 가독성을 위한 3자 변환 |
| `kwcag22-websoul` | 웹소울랩 KWCAG 2.2 안내 | https://websoul.co.kr/accessibility/WA_guide22.asp | 2026-09-04 | ok | 접근성 컨설팅사의 해설 자료. 요구 문장 대조용으로만 참고 |
| `rra-kcs` | 국립전파연구원 방송통신표준(KCS) 공고 | (표준 공고 페이지 — 정확한 공고 번호·URL은 인증기관 문의로 재확인) | 2026-09-04 | `needsVerification` | 표준 번호 KS X OT0003 확인 필요 |
| `wcag22-w3c` | Web Content Accessibility Guidelines (WCAG) 2.2 | https://www.w3.org/TR/WCAG22/ | 2026-09-04 | ok | W3C 문서. [W3C Document License](https://www.w3.org/copyright/document-license/)에 따라 인용 가능 |
| `axe-core` | axe-core (Deque Systems) | https://github.com/dequelabs/axe-core | 2026-09-04 | ok | MPL-2.0. 규칙 엔진·`locales/ko.json` 사용, 소스 코드 재배포 없음(npm 의존성으로만 사용) |
| `easyread-mcp` | EASYREAD(전제 프로젝트, 동일 저자) | https://github.com/SWJoong/EASYREAD | 2026-09-04 | ok | 컨벤션·`schema-dialect.ts` 등 파일 재사용(동일 저자·MIT) |
| `certification-agency` | 웹접근성 품질인증 기관 공지(전문가·사용자 심사 기준 수치) | 한국디지털접근성진흥원(KWACC) 등 인증기관 공지 — `assets/certification.json`의 `criteria[].sourceUrl` 개별 확인 필요 | 2026-09-04 | `needsVerification` | 준수율·유효기간 수치는 인증기관이 개정할 수 있어 릴리스마다 재확인 필요 |

## 원칙

1. **원문 비전재**: 요구 문장은 표에서 한 줄만 인용하고, 설명·요약은 이 프로젝트가 새로 쓴다(NFR-04).
2. **`needsVerification`**: 공식 URL·수치를 아직 1차 출처로 확정하지 못한 항목은 이 값을 `true`로 두고
   진행한다(도구 결과에도 동일 고지가 전파된다 — `estimate_cert_readiness`의 `notices`).
3. **갱신 절차**: 이 문서(W) → `assets/sources.json`(U가 기계화) → 데이터 테스트(W)가 두 파일의 `id`
   집합 일치를 검증한다.
