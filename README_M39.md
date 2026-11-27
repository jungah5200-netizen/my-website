# M39 — YOU 화면 전환 오류 수정

원인: M35 스타일의 `#youHistoryScreen { display:flex!important }`가 숨김 규칙보다 우선하여, 모든 화면 위에 주고받은 마음 목록이 계속 표시됐습니다. M38의 버튼은 동작했지만 화면이 겹쳐 보였습니다.

수정: 숨김 상태 우선 처리(`.screen[hidden]`, `#youHistoryScreen[hidden]`)로 화면당 한 화면만 표시되도록 CSS 수정. 기존 사진 배경 4종, 음성 녹음, 받은 마음, 보낸 마음, 전송 완료, 감정등 및 저장 구조 유지.

테스트: HTML/CSS/JS를 임시 문서에 주입한 Chromium 기반 화면 전환 스모크 테스트. 서버에서 에셋 로드 및 실제 사용자 환경은 별도 확인이 필요합니다.
