const CAR = 'car';
const PARKING_LOCATION = 'parking-location';
const S3_OBJECT = 's3-object';
export const EventName = {
  CAR_UPDATED: `${CAR}.updated`,
  PARKING_LOCATION_NOTICE_CREATED: `${PARKING_LOCATION}.notice.created`,
  S3_OBJECT_CREATED: `${S3_OBJECT}.created`,
  S3_VIDEO_METADATA_CREATED: `${S3_OBJECT}.video.metadata.created`,
  REWARD_TRANSACTION: 'reward.transaction',
} as const;
