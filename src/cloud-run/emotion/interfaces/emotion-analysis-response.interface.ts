/**
 * Emotion label types
 */
export enum EmotionLabel {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  ANGRY = 'angry',
  DISGUST = 'disgust',
}

/**
 * Single emotion data
 */
export interface EmotionData {
  label: EmotionLabel | string;
  score: number;
}

/**
 * Emotion analysis response from Cloud Run API
 */
export interface EmotionAnalysisResponse {
  emotions: EmotionData[];
}

/**
 * Get the dominant emotion (highest score)
 * @param response - Emotion analysis response
 * @returns The emotion with the highest score
 */
export function getDominantEmotion(
  response: EmotionAnalysisResponse,
): EmotionData | null {
  if (!response.emotions || response.emotions.length === 0) {
    return null;
  }
  return response.emotions.reduce((prev, current) =>
    prev.score > current.score ? prev : current,
  );
}

/**
 * Get emotions above a certain threshold
 * @param response - Emotion analysis response
 * @param threshold - Minimum score threshold (0-1)
 * @returns Array of emotions above the threshold
 */
export function getEmotionsAboveThreshold(
  response: EmotionAnalysisResponse,
  threshold: number = 0.1,
): EmotionData[] {
  return response.emotions.filter((emotion) => emotion.score >= threshold);
}

/**
 * Get emotion score by label
 * @param response - Emotion analysis response
 * @param label - Emotion label to find
 * @returns The score for the specified emotion, or 0 if not found
 */
export function getEmotionScore(
  response: EmotionAnalysisResponse,
  label: EmotionLabel | string,
): number {
  const emotion = response.emotions.find((e) => e.label === label);
  return emotion?.score || 0;
}
