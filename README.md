# love-notes

여자친구에게 문구를 크게 보여주는 개인용 앱. 대면(내 폰을 보여줌)과 원격(링크 공유) 둘 다 지원.

## 구조

- `admin.html` — 문구를 추가/삭제/정렬하는 관리자 페이지 (비밀 링크로만 보호, 로그인 없음)
- `index.html` — 상대방이 보는 뷰어 페이지. `?t=토큰`으로 접근
- `js/config.js` — Supabase 프로젝트 정보
- `js/supabase-client.js` — DB 읽기/쓰기 함수
- `js/fit-text.js` — 문구 길이에 맞춰 폰트 크기 자동 조절
- `supabase/schema.sql` — DB 테이블 + RLS 정책

## 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 계정 생성 후 새 프로젝트 생성 (무료 티어로 충분)
2. 왼쪽 메뉴 **SQL Editor** 에서 `supabase/schema.sql` 내용을 붙여넣고 실행
3. **Project Settings > API** 에서 `Project URL`과 `anon public` 키를 복사
4. `js/config.js`를 열어 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 값을 채워넣기

## 2. 로컬에서 확인

정적 파일이라 별도 빌드 없이 로컬 서버로 열면 됩니다.

```bash
cd love-notes
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/admin.html` 접속.

## 3. 사용 흐름

1. `admin.html` 접속 → "새 리스트 만들기" 클릭
2. 주소창에 `?t=...` 가 붙은 URL이 생성됨 — **이 주소를 꼭 저장해두세요.** 로그인이 없어서 이 URL을 잃어버리면 다시 편집할 방법이 없습니다.
3. 문구를 추가/삭제/순서 변경
4. "보기 링크" 박스의 복사 버튼으로 뷰어 링크 복사 → 상대방에게 전송
5. 이후 관리자 페이지에서 문구를 수정하면 이미 보낸 링크에도 실시간으로 반영됩니다.

> 관리자 링크와 뷰어 링크가 같은 토큰을 씁니다. 신뢰하는 사람에게만 뷰어 링크를 보내세요 (합의된 트레이드오프).

## 4. GitHub Pages 배포

1. 이 폴더를 GitHub 저장소로 push
2. 저장소 **Settings > Pages** 에서 배포 브랜치를 `main` (또는 `master`), 폴더를 `/ (root)`로 설정
3. 몇 분 후 `https://<username>.github.io/<repo>/` 로 접속 가능
4. 배포된 주소 기준으로 `admin.html`, `index.html`을 사용
