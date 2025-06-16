1. MCP-Nest란?
   NestJS 모듈로, AI 모델/도구/프롬프트를 MCP 표준에 맞춰 API로 노출할 수 있게 해줍니다.
   복잡한 MCP 프로토콜 구현 없이, NestJS의 의존성 주입, 데코레이터, 모듈 시스템을 그대로 활용할 수 있습니다.
   자동으로 MCP 도구, 리소스, 프롬프트를 등록/발견합니다.
   Zod 기반의 파라미터 검증, 진행률 알림, 인증(Guard), 다양한 트랜스포트(HTTP, SSE, STDIO) 지원 등 엔터프라이즈급 기능을 제공합니다.
2. 주요 기능
   모든 트랜스포트 지원: HTTP, SSE(Server-Sent Events), STDIO
   자동 등록: MCP 도구/리소스/프롬프트 자동 등록
   Zod 검증: 파라미터 타입 검증
   진행률 알림: 클라이언트에 작업 진행률 전송
   NestJS Guard: 인증/인가 처리
   Request 정보 접근: 도구/리소스에서 HTTP Request 정보 활용 가능
3. 설치 방법
   Apply to readme.md
   Run
   zod
   @rekog/mcp-nest: MCP-Nest 모듈
   @modelcontextprotocol/sdk: MCP 표준 SDK
   zod: 파라미터 검증용 라이브러리
4. 기본 사용법

1) 모듈 등록
   Apply to readme.md
   }
2) 도구/리소스/프롬프트 정의
   Apply to readme.md
   }
3) 엔드포인트
   /mcp : MCP 메인 엔드포인트 (도구 실행, 리소스 접근 등)
   /sse : SSE 연결(실시간 알림)
   /messages : 도구 실행 요청
4) 인증/인가
   NestJS Guard를 그대로 사용합니다.
   Apply to readme.md
   }

5. 기타
   STDIO, SSE 등 다양한 트랜스포트 지원
   Zod로 파라미터 타입 안전성 보장
   기존 NestJS 서비스, 의존성 주입, 미들웨어, 가드, 인터셉터 등과 완벽 호환
6. 공식 문서/예제
   공식 GitHub README
   playground 폴더에 다양한 예제 포함
   요약
   MCP-Nest는 NestJS에서 MCP 서버를 쉽게 만들 수 있게 해주는 모듈입니다.
   도구/리소스/프롬프트를 NestJS 스타일로 정의하면, MCP 표준에 맞는 API가 자동으로 생성됩니다.
   인증, 파라미터 검증, 진행률 알림 등 엔터프라이즈급 기능을 제공합니다.
   자세한 예제나 특정 사용법이 궁금하면 추가로 질문해 주세요!
   참고:
   rekog-labs/MCP-Nest GitHub
   공식 README 예제
