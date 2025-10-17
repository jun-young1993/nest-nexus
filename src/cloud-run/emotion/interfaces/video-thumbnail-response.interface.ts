/**
 * 비디오 썸네일 생성 응답 인터페이스
 */
export interface VideoThumbnailResponse {
  /**
   * 썸네일 이미지 버퍼
   */
  buffer: Buffer;

  /**
   * MIME 타입 (Content-Type 헤더에서 추출)
   * 예: 'image/jpeg', 'image/png', 'image/webp'
   */
  mimetype: string;

  /**
   * 썸네일에서 감지된 주요 감정
   */
  emotion?: string;

  /**
   * 감정 분석 신뢰도 점수 (0-1)
   */
  confidence?: number;

  /**
   * 원본 파일명 (Content-Disposition 헤더에서 추출)
   */
  filename?: string;
}

