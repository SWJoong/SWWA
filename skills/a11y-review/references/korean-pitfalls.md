# 국내 사이트 반복 함정 (a11y-review)

해외 WCAG 도구가 놓치기 쉬운, 국내 웹에서 특히 자주 나오는 KWCAG 2.2 위반 패턴. `swwa`의 `k-`
규칙과 한국어 사전(`link-text-ko.json`·`alt-text-ko.json`)이 이들을 겨냥한다.

## 본문 바로가기 — 6.4.1(2.4.1)
- 국내 인증 심사에서 필수로 보는 항목. 페이지 첫 초점이 "본문 바로가기"/"메뉴 건너뛰기" 링크여야 하고 대상 앵커가 실제 존재해야 한다. `k-skip-link-first`·`k-skip-target-exists`, 동작은 `b-skip-link-works`.

## 새 창 안내 — 7.2.1(3.2.1)
- `target="_blank"` 링크에 "(새 창)"·"새 탭" 안내가 없으면 위반. `k-new-window-notice`.

## 무의미한 링크 텍스트 — 6.4.3(2.4.3)
- "더보기"·"자세히"·"바로가기"·"클릭"만으로 된 링크. `link-text-ko.json` 사전 기반 `k-link-text-generic`. `aria-label`로 목적 보완 가능.

## 무의미한 대체 텍스트 — 5.1.1(1.1.1)
- `alt="이미지"`·`alt="사진"`·파일명 alt. `alt-text-ko.json` 기반 `k-alt-meaningless`.

## 언어 선언 — 7.1.1(3.1.1)
- 한국어 본문인데 `lang` 누락/오설정. `k-lang-ko-expected`(한글 비율 ≥ 30% & lang ≠ ko*).

## select 자동 이동 — 7.2.1(3.2.1)
- 지역/카테고리 `<select onchange="이동">`. `k-select-onchange`(수동 확인). 이동 버튼 병행.

## 캡차(보안문자) — 7.3.3(3.3.3)
- 이미지 캡차만 제공. `k-captcha-detect`(수동 확인). 오디오·대체 인증 병행.

## placeholder 레이블 대용 — 7.3.2(3.3.2)
- placeholder만 두고 `<label>` 생략. `k-placeholder-only-label`.

## 자동재생 배경음/영상 — 5.4.2(1.4.2)
- 메인 배너 자동재생. `k-autoplay-media`.

이 목록은 `check_html` 한 번으로 대부분 탐지된다. 명도 대비·초점 표시·타깃 크기는 `audit_url`로 보완한다.
