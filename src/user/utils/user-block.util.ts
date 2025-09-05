import { Injectable } from '@nestjs/common';
import { UserBlockService } from '../user-block.service';

/**
 * 사용자 블록 관련 유틸리티 함수들
 */
@Injectable()
export class UserBlockUtil {
  constructor(private readonly userBlockService: UserBlockService) {}

  /**
   * 사용자가 특정 사용자를 블록했는지 확인
   * @param blockerId 블록을 한 사용자 ID
   * @param blockedId 블록당한 사용자 ID
   * @returns 블록 여부
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    return this.userBlockService.isUserBlocked(blockerId, blockedId);
  }

  /**
   * 사용자가 특정 사용자와 상호작용할 수 있는지 확인
   * (양방향 블록 체크)
   * @param userId1 사용자 1 ID
   * @param userId2 사용자 2 ID
   * @returns 상호작용 가능 여부
   */
  async canInteract(userId1: string, userId2: string): Promise<boolean> {
    if (userId1 === userId2) {
      return true; // 같은 사용자는 상호작용 가능
    }

    // 양방향 블록 체크
    const [user1BlockedUser2, user2BlockedUser1] = await Promise.all([
      this.isUserBlocked(userId1, userId2),
      this.isUserBlocked(userId2, userId1),
    ]);

    // 어느 한쪽이라도 블록했다면 상호작용 불가
    return !user1BlockedUser2 && !user2BlockedUser1;
  }

  /**
   * 사용자가 특정 사용자의 콘텐츠에 접근할 수 있는지 확인
   * (단방향 블록 체크 - 블로커가 블록당한 사용자의 콘텐츠에 접근 불가)
   * @param viewerId 콘텐츠를 보려는 사용자 ID
   * @param contentOwnerId 콘텐츠 소유자 ID
   * @returns 접근 가능 여부
   */
  async canViewContent(
    viewerId: string,
    contentOwnerId: string,
  ): Promise<boolean> {
    if (viewerId === contentOwnerId) {
      return true; // 자신의 콘텐츠는 항상 접근 가능
    }

    // viewer가 contentOwner를 블록했다면 접근 불가
    return !(await this.isUserBlocked(viewerId, contentOwnerId));
  }

  /**
   * 사용자가 특정 사용자에게 댓글을 달 수 있는지 확인
   * @param commenterId 댓글 작성자 ID
   * @param targetUserId 댓글 대상 사용자 ID
   * @returns 댓글 작성 가능 여부
   */
  async canComment(
    commenterId: string,
    targetUserId: string,
  ): Promise<boolean> {
    return this.canInteract(commenterId, targetUserId);
  }

  /**
   * 사용자가 특정 사용자에게 메시지를 보낼 수 있는지 확인
   * @param senderId 메시지 발신자 ID
   * @param receiverId 메시지 수신자 ID
   * @returns 메시지 전송 가능 여부
   */
  async canSendMessage(senderId: string, receiverId: string): Promise<boolean> {
    return this.canInteract(senderId, receiverId);
  }

  /**
   * 사용자가 특정 사용자를 팔로우할 수 있는지 확인
   * @param followerId 팔로우하려는 사용자 ID
   * @param followeeId 팔로우당할 사용자 ID
   * @returns 팔로우 가능 여부
   */
  async canFollow(followerId: string, followeeId: string): Promise<boolean> {
    return this.canInteract(followerId, followeeId);
  }
}
