# 전체 아키텍쳐
```
[ Flutter App ]
     ↓ 로그인
[ Firebase Authentication ]
     ↓ ID Token (JWT)
[ NestJS 서버 ]
     ↓ verifyIdToken
[ Firebase Admin SDK ]
     ↓ setCustomUserClaims
[ Firebase ]
```
👉 핵심 흐름:

Flutter → Firebase 로그인
Flutter → NestJS 요청 (ID Token 포함)
NestJS → 토큰 검증
NestJS → Claims 설정

1️⃣ 프로젝트 구조 (NestJS)
```
src/
 ├── auth/
 │    ├── auth.controller.ts
 │    ├── auth.service.ts
 │    ├── firebase-auth.guard.ts
 │
 ├── user/
 │    ├── user.service.ts
 │
 ├── firebase/
 │    ├── firebase.module.ts
 │    ├── firebase.provider.ts
 │
 ├── subscription/
 │    ├── subscription.controller.ts
 │    ├── subscription.service.ts
 │
 └── main.ts

```


✅ 전체 구조 (멀티 프로젝트)
```
[ Flutter App A ] → Firebase A
[ Flutter App B ] → Firebase B

        ↓ (ID Token)

        [ NestJS API ]
              ↓
   FirebaseApp Resolver (핵심)
      ├── appA (Firebase A)
      └── appB (Firebase B)
```