# ARIA 위젯 접근성 점검 (a11y-review)

커스텀 위젯(모달·탭·아코디언·드롭다운·툴팁 등)은 8.2.1(4.2.1) "웹 애플리케이션 접근성" 대상이다.
`get_checklist`의 `scope=component, component=widget|modal`로 점검 목록을 받을 수 있다.

## 이름·역할·값 — 8.2.1(4.2.1)
- 모든 대화형 요소에 접근 가능한 이름(텍스트·`aria-label`·`aria-labelledby`). axe `button-name`·`aria-*-name`이 잡는다.
- `role`은 유효한 값, 필수 속성 동반(`role="dialog"`+`aria-labelledby`, `role="checkbox"`+`aria-checked` 등).
- 잘못된 `aria-*` 속성/값 금지(axe `aria-valid-attr`·`aria-allowed-attr`).

## 키보드 조작 — 6.1.1(2.1.1)·6.1.2(2.1.2)
- 모든 기능을 키보드만으로. 마우스 전용 위젯은 `b-keyboard-reachable`(Tab 순회 미도달)·`k-mouse-only-handler`가 잡는다.
- WAI-ARIA Authoring Practices의 키보드 패턴(탭=화살표, 모달=Esc 닫기·초점 트랩, 메뉴=화살표 등) 준수.
- 초점 순서가 DOM·시각 순서와 일치 — `b-focus-order`. 초점 표시 보이기 — `b-focus-visible`.

## 모달 초점 관리 — 6.1.2(2.1.2)
- 열릴 때 모달로 초점 이동, 닫힐 때 트리거로 복귀, 열린 동안 초점 트랩. (동적 동작이라 `audit_url` 또는 수동 확인.)

## 상태 변화 알림 — 8.2.1(4.2.1)
- 동적 상태 변경은 `aria-live`/`role="status"`로 스크린리더에 알림.

## 검사
정적 axe(`check_html`)로 이름·역할·속성 유효성을 상당 부분 확인하고, 키보드 조작·초점 관리는
`audit_url`(checks에 `keyboard` 포함) 또는 수동 시나리오로 검증한다. 실험 규칙
`label-content-name-mismatch`는 브라우저 감사에서 별도 실행된다.
