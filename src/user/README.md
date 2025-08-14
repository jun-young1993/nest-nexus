# User Group Management

사용자 그룹 관리 기능을 제공하는 모듈입니다.

## 기능

### 사용자 그룹 관리
- 그룹 생성, 수정, 삭제
- 그룹 활성/비활성 상태 관리
- 시스템 그룹 보호 (수정/삭제 불가)

### 사용자-그룹 관계 관리
- 사용자를 그룹에 추가
- 사용자를 그룹에서 제거
- 그룹 멤버 조회
- 사용자가 속한 그룹 조회

## API 엔드포인트

### 그룹 관리
- `POST /user-groups` - 새 그룹 생성
- `GET /user-groups` - 모든 그룹 조회
- `GET /user-groups?active=true` - 활성 그룹만 조회
- `GET /user-groups/:id` - 특정 그룹 조회
- `PATCH /user-groups/:id` - 그룹 정보 수정
- `DELETE /user-groups/:id` - 그룹 삭제

### 사용자-그룹 관계
- `GET /user-groups/:id/users` - 그룹 멤버 조회
- `GET /user-groups/:id/member-count` - 그룹 멤버 수 조회
- `GET /user-groups/user/:userId` - 사용자가 속한 그룹 조회
- `POST /user-groups/:id/add-users` - 사용자를 그룹에 추가
- `POST /user-groups/:id/remove-users` - 사용자를 그룹에서 제거

## Swagger API 문서

이 모듈은 Swagger를 통해 자동으로 API 문서화됩니다.

### Swagger 접근
- **URL**: `/docs`
- **인증**: Basic Auth (환경변수 `SWAGGER_USER`, `SWAGGER_PASSWORD` 필요)

### Swagger 기능
- 모든 API 엔드포인트에 대한 상세 설명
- 요청/응답 스키마 자동 생성
- API 테스트 인터페이스
- 요청/응답 예시 제공
- 에러 코드 및 메시지 문서화

## 데이터 모델

### UserGroup 엔티티
```typescript
{
  id: string;           // UUID
  name: string;         // 그룹 이름 (유니크)
  description: string;  // 그룹 설명
  isActive: boolean;    // 활성 상태
  isSystem: boolean;    // 시스템 그룹 여부
  createdAt: Date;      // 생성 날짜
  updatedAt: Date;      // 수정 날짜
  users: User[];        // 그룹 멤버들
}
```

### 관계
- `User` ↔ `UserGroup`: Many-to-Many
- 중간 테이블: `user_group_members`

## 보안 기능

- 시스템 그룹은 수정/삭제 불가
- 멤버가 있는 그룹은 삭제 불가
- 그룹 이름 중복 방지
- 입력 데이터 유효성 검사

## 사용 예시

### 그룹 생성
```typescript
const newGroup = await userGroupService.create({
  name: 'Developers',
  description: 'Development team members',
  isActive: true
});
```

### 사용자 추가
```typescript
await userGroupService.addUsersToGroup({
  groupId: 'group-uuid',
  userIds: ['user1-uuid', 'user2-uuid']
});
```

### 그룹 멤버 조회
```typescript
const members = await userGroupService.findUsersByGroupId('group-uuid');
const memberCount = await userGroupService.getGroupMemberCount('group-uuid');
```

## API 테스트

Swagger UI를 통해 다음을 테스트할 수 있습니다:

1. **그룹 생성**: POST `/user-groups`
2. **그룹 조회**: GET `/user-groups`
3. **사용자 추가**: POST `/user-groups/:id/add-users`
4. **사용자 제거**: POST `/user-groups/:id/remove-users`
5. **그룹 삭제**: DELETE `/user-groups/:id`

## 에러 처리

모든 API 엔드포인트는 적절한 HTTP 상태 코드와 함께 에러 메시지를 반환합니다:

- `400 Bad Request`: 유효성 검사 실패, 중복 그룹 이름
- `404 Not Found`: 그룹 또는 사용자를 찾을 수 없음
- `409 Conflict`: 그룹 이름 중복
- `500 Internal Server Error`: 서버 내부 오류
