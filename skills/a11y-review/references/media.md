# 미디어 접근성 점검 (a11y-review)

## 자막·대체수단 — 5.2.1(1.2.1)
- `<video>`에 `<track kind="captions" srclang="ko">` 제공 — `k-media-track`가 자막 트랙 없는 video를 잡는다.
- 음성 정보는 자막·대본으로, 영상 정보는 화면 해설 또는 대본으로 제공.
- 자동 생성 자막은 오탈자 검수 필요(수동).

## 자동재생 — 5.4.2(1.4.2)
- 소리가 사용자 동의 없이 자동재생되지 않아야. `autoplay`는 `muted`와 함께이거나 없어야 — `k-autoplay-media`(video/audio autoplay, bgsound, embed·iframe의 autoplay 파라미터).

## 정지 컨트롤 — 6.2.2(2.2.2)
- 자동으로 움직이거나 갱신되는 콘텐츠(캐러셀·슬라이더·자동재생)에 정지/일시정지 — `b-motion-runtime`(브라우저)이 5초 관찰 중 자동 변경 + 정지 컨트롤 없음을 잡는다.

## 광과민성 — 6.3.1(2.3.1)
- 초당 3~50회 점멸 금지. 자동 판정 어려움 — 애니메이션 주기를 사람이 확인(수동).

## before / after
```html
<!-- before -->
<video src="lecture.mp4" controls></video>
<!-- after -->
<video src="lecture.mp4" controls>
  <track kind="captions" src="captions-ko.vtt" srclang="ko" label="한국어">
</video>
```
