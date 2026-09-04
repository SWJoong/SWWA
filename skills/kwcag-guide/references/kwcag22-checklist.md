# KWCAG 2.2 검사항목 체크리스트 — 단일 소스

> **이 파일이 검사항목·규칙 ID·자동화 등급의 단일 소스다**(ADR-04). `assets/kwcag22.json`·`src/rules`·`tests/`는 이 표를 따른다. 변경 절차: 이 파일(W) → `kwcag22.json`(U) → 데이터 테스트(W). 문서에서 검사항목을 인용할 때는 `6.4.1(2.4.1) 반복 영역 건너뛰기`처럼 **공식 번호(별칭)** 를 병기한다.
>
> 출처: 국립전파연구원 방송통신표준 「한국형 웹 콘텐츠 접근성 지침 2.2」(KS X OT0003, 2022-12 개정) — 비공식 HTML판 https://a11ykr.github.io/kwcag22/ , 웹소울랩 https://websoul.co.kr/accessibility/WA_guide22.asp (확인일 2026-09-04). 요구 문장만 한 줄 인용하고 설명은 자체 요약이다.

## 1. 용어

| 용어 | 뜻 |
|---|---|
| 공식 번호 | 표준 본문 장 번호 기준 `5.1.1`~`8.2.1`(5=인식, 6=운용, 7=이해, 8=견고) |
| 별칭 | 업계·인증 실무에서 쓰는 `1.1.1`~`4.2.1` |
| 자동화 등급 | **자동**(auto): 도구가 fail을 확정 · **보조**(assist): 후보를 탐지하고 사람이 확정 · **수동**(manual): 체크리스트만 · **N/A**: 조건부(해당 콘텐츠가 있을 때만) |
| 규칙 ID | `k-*` 정적(jsdom) 규칙, `b-*` 브라우저(Playwright) 규칙, 그 외는 axe-core 규칙 ID |
| 티어 | T1 = M2 구현, T2 = M3(일부 백로그 허용), B = 브라우저(M3) |
| 상태 | Report의 검사항목 상태 `fail` / `incomplete` / `manual` / `pass` / `na` |

## 2. 원칙·지침 (4원칙 · 14지침)

| 원칙 | 지침 |
|---|---|
| 5(1) 인식의 용이성 | 5.1(1.1) 대체 텍스트 · 5.2(1.2) 멀티미디어 대체수단 · 5.3(1.3) 적응성 · 5.4(1.4) 명료성 |
| 6(2) 운용의 용이성 | 6.1(2.1) 입력장치 접근성 · 6.2(2.2) 충분한 시간 제공 · 6.3(2.3) 광과민성 발작 예방 · 6.4(2.4) 쉬운 내비게이션 · 6.5(2.5) 입력 방식 |
| 7(3) 이해의 용이성 | 7.1(3.1) 가독성 · 7.2(3.2) 예측 가능성 · 7.3(3.3) 입력 도움 |
| 8(4) 견고성 | 8.1(4.1) 문법 준수 · 8.2(4.2) 웹 애플리케이션 접근성 |

## 3. 검사항목 33개 — 요구 문장 (원문 한 줄 인용)

| ID(별칭) | 검사항목 | 요구 문장 | 2.2 신규 |
|---|---|---|---|
| 5.1.1 (1.1.1) | 적절한 대체 텍스트 제공 | 텍스트 아닌 콘텐츠는 그 의미나 용도를 이해할 수 있도록 대체 텍스트를 제공해야 한다. | |
| 5.2.1 (1.2.1) | 자막 제공 | 멀티미디어 콘텐츠에는 자막, 원고 또는 수어를 제공해야 한다. | |
| 5.3.1 (1.3.1) | 표의 구성 | 표는 이해하기 쉽게 구성해야 한다. | |
| 5.3.2 (1.3.2) | 콘텐츠의 선형구조 | 콘텐츠는 논리적인 순서로 제공해야 한다. | |
| 5.3.3 (1.3.3) | 명확한 지시사항 제공 | 지시사항은 모양, 크기, 위치, 방향, 색, 소리 등에 관계없이 인식될 수 있어야 한다. | |
| 5.4.1 (1.4.1) | 색에 무관한 콘텐츠 인식 | 콘텐츠는 색에 관계없이 인식될 수 있어야 한다. | |
| 5.4.2 (1.4.2) | 자동 재생 금지 | 자동으로 소리가 재생되지 않아야 한다. | |
| 5.4.3 (1.4.3) | 텍스트 콘텐츠의 명도 대비 | 텍스트 콘텐츠와 배경 간의 명도 대비는 4.5 대 1 이상이어야 한다. | |
| 5.4.4 (1.4.4) | 콘텐츠 간의 구분 | 이웃한 콘텐츠는 구별될 수 있어야 한다. | |
| 6.1.1 (2.1.1) | 키보드 사용 보장 | 모든 기능은 키보드만으로도 사용할 수 있어야 한다. | |
| 6.1.2 (2.1.2) | 초점 이동과 표시 | 키보드에 의한 초점은 논리적으로 이동해야 하며, 시각적으로 구별할 수 있어야 한다. | |
| 6.1.3 (2.1.3) | 조작 가능 | 사용자 입력 및 컨트롤은 조작 가능하도록 제공되어야 한다. | |
| 6.1.4 (2.1.4) | 문자 단축키 | 문자 단축키는 오동작으로 인한 오류를 방지하여야 한다. | ✅ |
| 6.2.1 (2.2.1) | 응답시간 조절 | 시간제한이 있는 콘텐츠는 응답시간을 조절할 수 있어야 한다. | |
| 6.2.2 (2.2.2) | 정지 기능 제공 | 자동으로 변경되는 콘텐츠는 움직임을 제어할 수 있어야 한다. | |
| 6.3.1 (2.3.1) | 깜빡임과 번쩍임 사용 제한 | 초당 3~50회 주기로 깜빡이거나 번쩍이는 콘텐츠를 제공하지 않아야 한다. | |
| 6.4.1 (2.4.1) | 반복 영역 건너뛰기 | 콘텐츠의 반복되는 영역은 건너뛸 수 있어야 한다. | |
| 6.4.2 (2.4.2) | 제목 제공 | 페이지, 프레임, 콘텐츠 블록에는 적절한 제목을 제공해야 한다. | |
| 6.4.3 (2.4.3) | 적절한 링크 텍스트 | 링크 텍스트는 용도나 목적을 이해할 수 있도록 제공해야 한다. | |
| 6.4.4 (2.4.4) | 고정된 참조 위치 정보 | 전자출판문서 형식의 웹 페이지는 각 페이지로 이동할 수 있는 기능이 있어야 하고, 서식이나 플랫폼에 상관없이 참조 위치 정보를 일관되게 제공·유지해야 한다. | ✅ |
| 6.5.1 (2.5.1) | 단일 포인터 입력 지원 | 다중 포인터 또는 경로기반 동작을 통한 입력은 단일 포인터 입력으로도 조작할 수 있어야 한다. | ✅ |
| 6.5.2 (2.5.2) | 포인터 입력 취소 | 단일 포인터 입력으로 실행되는 기능은 취소할 수 있어야 한다. | ✅ |
| 6.5.3 (2.5.3) | 레이블과 네임 | 텍스트 또는 텍스트 이미지가 포함된 레이블이 있는 사용자 인터페이스 구성요소는 네임에 시각적으로 표시되는 해당 텍스트를 포함해야 한다. | ✅ |
| 6.5.4 (2.5.4) | 동작기반 작동 | 동작기반으로 작동하는 기능은 사용자 인터페이스 구성요소로 조작할 수 있고, 동작기반 기능을 비활성화할 수 있어야 한다. | ✅ |
| 7.1.1 (3.1.1) | 기본 언어 표시 | 주로 사용하는 언어를 명시해야 한다. | |
| 7.2.1 (3.2.1) | 사용자 요구에 따른 실행 | 사용자가 의도하지 않은 기능(새 창, 초점에 의한 맥락 변화 등)은 실행되지 않아야 한다. | |
| 7.2.2 (3.2.2) | 찾기 쉬운 도움 정보 | 도움 정보가 제공되는 경우, 각 페이지에서 동일한 상대적인 순서로 접근할 수 있어야 한다. | ✅ |
| 7.3.1 (3.3.1) | 오류 정정 | 입력 오류를 정정할 수 있는 방법을 제공해야 한다. | |
| 7.3.2 (3.3.2) | 레이블 제공 | 사용자 입력에는 대응하는 레이블을 제공해야 한다. | |
| 7.3.3 (3.3.3) | 접근 가능한 인증 | 인증 과정은 인지 기능 테스트에만 의존해서는 안 된다. | ✅ |
| 7.3.4 (3.3.4) | 반복 입력 정보 | 반복되는 입력 정보는 자동 입력 또는 선택 입력할 수 있어야 한다. | ✅ |
| 8.1.1 (4.1.1) | 마크업 오류 방지 | 마크업 언어의 요소는 열고 닫음, 중첩 관계 및 속성 선언에 오류가 없어야 한다. | |
| 8.2.1 (4.2.1) | 웹 애플리케이션 접근성 준수 | 콘텐츠에 포함된 웹 애플리케이션은 접근성이 있어야 한다. | |

신규 9항목(2.1 → 2.2): 6.1.4 · 6.4.4 · 6.5.1 · 6.5.2 · 6.5.3 · 6.5.4 · 7.2.2 · 7.3.3 · 7.3.4. (2.1의 24항목은 번호·명칭 일부가 재배치되었다 — `wcag-mapping.md` §2 대조표.)

## 4. 검사항목 × 엔진 × 자동화 등급 (규칙 카탈로그)

WCAG 번호는 **WCAG 2.2 확정본(2023-10)** 기준이다. KWCAG 2.2 원문의 참조가 2.2 초안 번호일 수 있어 7.2.2→3.2.6, 7.3.3→3.3.8, 7.3.4→3.3.7로 매핑했다(검증 필요 — `wcag-mapping.md`).

| ID(별칭) | 검사항목 | WCAG 2.2 | axe 규칙 | 자체 규칙 (티어: 의도) | 등급 |
|---|---|---|---|---|---|
| 5.1.1 (1.1.1) | 적절한 대체 텍스트 제공 | 1.1.1 | image-alt, input-image-alt, area-alt, object-alt, svg-img-alt, role-img-alt | k-alt-meaningless (T1: 파일명·"이미지"·"사진"·공백 alt) | 보조 |
| 5.2.1 (1.2.1) | 자막 제공 | 1.2.1, 1.2.2, 1.2.3 | video-caption | k-media-track (T1: video/audio에 track[kind=captions] 없음) | 보조 |
| 5.3.1 (1.3.1) | 표의 구성 | 1.3.1 | td-headers-attr, th-has-data-cells, scope-attr-valid, table-fake-caption, table-duplicate-name | k-table-caption (T1: 데이터 표에 caption 없음), k-table-th-missing (T1: th 없는 데이터 표) | 보조 |
| 5.3.2 (1.3.2) | 콘텐츠의 선형구조 | 1.3.2 | heading-order(best-practice) | k-tabindex-positive (T1: tabindex > 0) | 보조 |
| 5.3.3 (1.3.3) | 명확한 지시사항 제공 | 1.3.3 | — | k-sensory-instruction (T2: "오른쪽의·빨간·둥근" 등 감각 지시어, confidence low) | 수동 |
| 5.4.1 (1.4.1) | 색에 무관한 콘텐츠 인식 | 1.4.1 | link-in-text-block(브라우저) | — | 수동 |
| 5.4.2 (1.4.2) | 자동 재생 금지 | 1.4.2 | no-autoplay-audio(브라우저) | k-autoplay-media (T1: audio/video[autoplay]:not([muted]), bgsound, embed·iframe autoplay 파라미터) | 자동 |
| 5.4.3 (1.4.3) | 텍스트 콘텐츠의 명도 대비 | 1.4.3 | color-contrast(브라우저) | `check_contrast` 도구(정적 색상 쌍) | 자동(브라우저) / 수동(정적) |
| 5.4.4 (1.4.4) | 콘텐츠 간의 구분 | (1.4.11 참고) | — | — | 수동 |
| 6.1.1 (2.1.1) | 키보드 사용 보장 | 2.1.1 | scrollable-region-focusable, nested-interactive, server-side-image-map | k-mouse-only-handler (T1: 비대화형 요소에 onclick/onmouseover만, tabindex·role 없음), b-keyboard-reachable (B: 대화형인데 Tab 순회에 없음) | 보조 |
| 6.1.2 (2.1.2) | 초점 이동과 표시 | 2.4.3, 2.4.7 | — | k-outline-none (T2: CSS `outline: 0/none` on :focus, 대안 스타일 없음), b-focus-visible (B: 초점 전후 계산 스타일 차이 없음), b-focus-order (B: DOM 순서 대비 역행) | 보조 |
| 6.1.3 (2.1.3) | 조작 가능 | (2.5.5, 2.5.8 참고) | target-size(브라우저) | b-target-size-6mm (B: 대각선 < 6mm ≈ 22.7px@96dpi, 인라인 텍스트 링크 예외) | 보조(브라우저) |
| 6.1.4 (2.1.4) | 문자 단축키 | 2.1.4 | — | k-accesskey (T2: accesskey 사용 → 검토) | 수동 |
| 6.2.1 (2.2.1) | 응답시간 조절 | 2.2.1 | meta-refresh | k-session-timeout-hint (T2: "자동 로그아웃·세션 만료" 문구 → 연장 수단 확인) | 보조 |
| 6.2.2 (2.2.2) | 정지 기능 제공 | 2.2.2 | blink, marquee | k-carousel-no-pause (T2: 슬라이더·롤링 컨테이너에 정지/일시정지 컨트롤 없음), b-motion-runtime (B: 5초 이상 자동 DOM 변경 + 정지 컨트롤 없음) | 보조 |
| 6.3.1 (2.3.1) | 깜빡임과 번쩍임 사용 제한 | 2.3.1 | — | k-flash-animation (T2: animation-duration < 0.33s & infinite) | 수동 |
| 6.4.1 (2.4.1) | 반복 영역 건너뛰기 | 2.4.1 | bypass, skip-link | k-skip-link-first (T1: 문서 첫 초점 요소가 문서 내 앵커 링크), k-skip-target-exists (T1: 링크 대상 존재), b-skip-link-works (B: Tab→Enter→초점 이동) | 자동 |
| 6.4.2 (2.4.2) | 제목 제공 | 2.4.2 (2.4.6 참고) | document-title, frame-title, frame-title-unique, page-has-heading-one, empty-heading | k-title-generic (T1: 빈/기본/사이트명만), k-iframe-title (T1: iframe title 없음·무의미) | 자동 |
| 6.4.3 (2.4.3) | 적절한 링크 텍스트 | 2.4.4 | link-name | k-link-text-generic (T1: `link-text-ko.json` 사전 일치), k-link-same-text-diff-href (T2: 같은 텍스트·다른 href) | 보조 |
| 6.4.4 (2.4.4) | 고정된 참조 위치 정보 | — (전자출판) | — | — | N/A |
| 6.5.1 (2.5.1) | 단일 포인터 입력 지원 | 2.5.1 | — | k-gesture-listener (T2: touchmove/pinch/swipe 핸들러 문자열) | 수동 |
| 6.5.2 (2.5.2) | 포인터 입력 취소 | 2.5.2 | — | k-down-event-action (T2: onmousedown/onpointerdown/ontouchstart 인라인 핸들러) | 보조 |
| 6.5.3 (2.5.3) | 레이블과 네임 | 2.5.3 | label-content-name-mismatch(experimental → 활성화) | — | 보조 |
| 6.5.4 (2.5.4) | 동작기반 작동 | 2.5.4 | — | k-device-motion (T2: devicemotion/deviceorientation 리스너) | 수동 |
| 7.1.1 (3.1.1) | 기본 언어 표시 | 3.1.1 | html-has-lang, html-lang-valid, html-xml-lang-mismatch, valid-lang | k-lang-ko-expected (T1: 본문 한글 비율 ≥ 30%인데 lang ≠ ko*) | 자동 |
| 7.2.1 (3.2.1) | 사용자 요구에 따른 실행 | 3.2.1, 3.2.2 | — | k-new-window-notice (T1: target=_blank인데 "새 창" 안내 없음), k-select-onchange (T1: select[onchange]로 이동·제출), k-onload-popup (T2: window.open on load) | 보조 |
| 7.2.2 (3.2.2) | 찾기 쉬운 도움 정보 | 3.2.6 | — | (`audit_site` 백로그: 도움 링크 상대 순서 비교) | 수동 |
| 7.3.1 (3.3.1) | 오류 정정 | 3.3.1, 3.3.3 | — | k-error-association (T2: aria-invalid 필드에 aria-describedby/오류 메시지 연결 없음) | 보조 |
| 7.3.2 (3.3.2) | 레이블 제공 | 3.3.2 (1.3.1, 4.1.2 참고) | label, label-title-only, select-name, form-field-multiple-labels | k-placeholder-only-label (T1: placeholder만 있고 label·aria-label 없음) | 자동 |
| 7.3.3 (3.3.3) | 접근 가능한 인증 | 3.3.8 | — | k-captcha-detect (T1: captcha/recaptcha/보안문자/자동입력 방지 탐지 → 대안 확인) | 보조 |
| 7.3.4 (3.3.4) | 반복 입력 정보 | 3.3.7 | autocomplete-valid | k-autocomplete-missing (T2: 이름·이메일·전화·주소 필드에 autocomplete 없음) | 보조 |
| 8.1.1 (4.1.1) | 마크업 오류 방지 | 4.1.1 | duplicate-id-active, duplicate-id-aria | k-parse-errors (T1: parse5 onParseError — 닫힘·중첩·중복 속성) | 자동 |
| 8.2.1 (4.2.1) | 웹 애플리케이션 접근성 준수 | 4.1.2 | aria-allowed-attr, aria-required-attr, aria-roles, aria-valid-attr, aria-valid-attr-value, aria-hidden-focus, aria-hidden-body, button-name, aria-command-name, aria-input-field-name, aria-toggle-field-name, aria-dialog-name, aria-progressbar-name, aria-tooltip-name, aria-treeitem-name, presentation-role-conflict | b-widget-keyboard (백로그: role 위젯 키보드 조작) | 보조 |

등급 집계: 자동 7 · 보조 17 · 수동 8 · N/A 1 = 33.

## 5. 규칙 ID 목록

- **T1 (18, M2)**: k-alt-meaningless · k-media-track · k-table-caption · k-table-th-missing · k-tabindex-positive · k-autoplay-media · k-mouse-only-handler · k-skip-link-first · k-skip-target-exists · k-title-generic · k-iframe-title · k-link-text-generic · k-lang-ko-expected · k-new-window-notice · k-select-onchange · k-placeholder-only-label · k-captcha-detect · k-parse-errors
- **T2 (13, M3·백로그 허용)**: k-sensory-instruction · k-outline-none · k-accesskey · k-session-timeout-hint · k-carousel-no-pause · k-flash-animation · k-link-same-text-diff-href · k-gesture-listener · k-down-event-action · k-device-motion · k-onload-popup · k-error-association · k-autocomplete-missing
- **B (6, M3)**: b-keyboard-reachable · b-focus-visible · b-focus-order · b-target-size-6mm · b-motion-runtime · b-skip-link-works · (백로그) b-widget-keyboard

## 6. 검사항목 상태 판정 규칙 (Report `checkpoints[].status`)

1. 귀속 규칙(axe·k·b) 중 `fail` 존재 → `fail`
2. `incomplete`만 존재 → `incomplete`
3. 자동/보조 규칙이 실행되어 모두 pass → `pass`
4. 등급이 수동이거나, 정적 모드에서 귀속 규칙이 전부 비활성 → `manual`(notice "브라우저 감사 필요" 또는 "수동 확인")
5. 6.4.4처럼 조건부 → `na`(전자출판 콘텐츠 징후가 있으면 `manual`로 승격)

정적 모드 비활성 axe 규칙: color-contrast, color-contrast-enhanced, link-in-text-block, target-size, scrollable-region-focusable, no-autoplay-audio, frame-tested, css-orientation-lock.
