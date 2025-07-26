# App Reward Module

리워드 앱의 포인트 관리 시스템을 위한 모듈입니다.

## 주요 기능

- 사용자 포인트 잔액 관리
- 포인트 거래 내역 추적
- 리워드 설정 관리
- 일일 사용 제한 및 쿨다운 관리
- AdMob 리워드 광고 연동

## 엔티티 구조

### 1. UserPointBalance (사용자 포인트 잔액)

- `currentPoints`: 현재 포인트
- `totalEarnedPoints`: 총 획득 포인트
- `totalSpentPoints`: 총 사용 포인트
- `totalWithdrawnPoints`: 총 출금 포인트

### 2. PointTransaction (포인트 거래 내역)

- `transactionType`: 거래 타입 (earn, spend, withdraw, refund, bonus)
- `source`: 거래 소스 (admob_reward, offerwall, daily_bonus, etc.)
- `amount`: 거래 금액
- `balanceBefore/After`: 거래 전후 잔액
- `referenceId`: 참조 ID (광고 ID, 주문 ID 등)

### 3. RewardConfig (리워드 설정)

- `rewardType`: 리워드 타입
- `pointsPerReward`: 리워드당 포인트
- `dailyLimit`: 일일 제한
- `cooldownMinutes`: 쿨다운 시간

### 4. UserRewardUsage (사용자 리워드 사용 내역)

- 일일 사용 횟수 및 포인트 추적

## API 엔드포인트

### 포인트 조회

```
GET /app-reward/points/:userId
```

### 리워드 처리

```
POST /app-reward/reward
POST /app-reward/reward/admob
```

### 거래 내역 조회

```
GET /app-reward/transactions/:userId?limit=50&offset=0
```

### 일일 사용 현황

```
GET /app-reward/daily-usage/:userId?date=2024-01-01
```

## 사용 예시

### 1. 사용자 포인트 조회

```typescript
const balance = await appRewardService.getUserPointBalance(userId);
console.log(`현재 포인트: ${balance.currentPoints}`);
console.log(`총 획득 포인트: ${balance.totalEarnedPoints}`);
```

### 2. 리워드 처리

```typescript
const transaction = await appRewardService.processReward({
  userId: 'user-id',
  source: TransactionSource.ADMOB_REWARD,
  referenceId: 'ad-id',
});
```

### 3. AdMob 콜백 연동

```
GET /admob/reward-callback/:appId/:type
```

## 설정

### 초기 리워드 설정 데이터

`src/app-reward/seed/reward-config.seed.ts`에서 기본 설정을 확인할 수 있습니다.

- AdMob 리워드: 10포인트, 하루 20번, 5분 쿨다운
- 오퍼월: 50포인트, 하루 10번, 10분 쿨다운
- 일일 보너스: 100포인트, 하루 1번, 24시간 쿨다운

## 데이터베이스 마이그레이션

새로운 엔티티들을 데이터베이스에 반영하려면:

```bash
npm run typeorm:generate
npm run typeorm:run
```

## 보안 고려사항

1. **트랜잭션 처리**: 모든 포인트 거래는 데이터베이스 트랜잭션으로 처리
2. **잔액 검증**: 음수 잔액 방지
3. **제한 관리**: 일일 제한 및 쿨다운 체크
4. **로그 기록**: 모든 거래 내역 추적

## 확장 가능성

- 다양한 리워드 소스 추가
- 포인트 출금 시스템
- 리워드 캠페인 관리
- 실시간 알림 시스템
- 통계 및 분석 기능
