import { RewardConfig, RewardType } from '../entities/reward-config.entity';

export const rewardConfigSeedData: Partial<RewardConfig>[] = [
  {
    rewardType: RewardType.ADMOB_REWARD,
    name: 'AdMob 리워드 광고',
    pointsPerReward: 10,
    dailyLimit: 20, // 하루 20번
    cooldownMinutes: 5, // 5분 쿨다운
    isActive: true,
    description: 'AdMob 리워드 광고 시청 시 포인트 획득',
  },
  {
    rewardType: RewardType.OFFERWALL,
    name: '오퍼월 리워드',
    pointsPerReward: 50,
    dailyLimit: 10, // 하루 10번
    cooldownMinutes: 10, // 10분 쿨다운
    isActive: true,
    description: '오퍼월 완료 시 포인트 획득',
  },
  {
    rewardType: RewardType.DAILY_BONUS,
    name: '일일 보너스',
    pointsPerReward: 100,
    dailyLimit: 1, // 하루 1번
    cooldownMinutes: 1440, // 24시간 쿨다운
    isActive: true,
    description: '매일 첫 로그인 시 보너스 포인트',
  },
  {
    rewardType: RewardType.REFERRAL,
    name: '추천인 리워드',
    pointsPerReward: 500,
    dailyLimit: 0, // 무제한
    cooldownMinutes: 0, // 쿨다운 없음
    isActive: true,
    description: '친구 추천 시 포인트 획득',
  },
  {
    rewardType: RewardType.PURCHASE,
    name: '구매 리워드',
    pointsPerReward: 1000,
    dailyLimit: 0, // 무제한
    cooldownMinutes: 0, // 쿨다운 없음
    isActive: true,
    description: '앱 내 구매 시 포인트 획득',
  },
];
