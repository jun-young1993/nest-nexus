import { Injectable } from '@nestjs/common';
import { S3ObjectScopeService } from './s3-object-scope.service';
import { S3ObjectQueryService } from './s3-object-query.service';

/**
 * S3Object 글로벌 스코프 사용 예시
 */
@Injectable()
export class S3ObjectExampleService {
  constructor(
    private readonly s3ObjectScopeService: S3ObjectScopeService,
    private readonly s3ObjectQueryService: S3ObjectQueryService,
  ) {}

  /**
   * 방법 1: Soft Delete 사용 (권장)
   * - TypeORM의 내장 기능 사용
   * - deletedAt 필드로 자동 필터링
   * - 복구 가능
   */
  async exampleSoftDelete() {
    // 삭제된 객체는 자동으로 제외됨
    const activeObjects = await this.s3ObjectScopeService.findActive({
      relations: ['tags', 'likes'],
    });

    // 삭제된 객체도 포함하여 조회 (관리자용)
    const allObjects = await this.s3ObjectScopeService.findAllIncludingInactive({
      relations: ['tags', 'likes'],
    });

    return { activeObjects, allObjects };
  }

  /**
   * 방법 2: 커스텀 스코프 서비스 사용
   * - active 필드를 명시적으로 관리
   * - 더 세밀한 제어 가능
   */
  async exampleCustomScope() {
    // 활성화된 객체만 조회
    const activeObjects = await this.s3ObjectScopeService.findActive({
      relations: ['tags', 'likes'],
    });

    // 특정 사용자의 활성화된 객체 조회
    const userActiveObjects = await this.s3ObjectScopeService.findActive({
      where: { userId: 'user-id' },
      relations: ['tags'],
    });

    // 객체 비활성화
    await this.s3ObjectScopeService.deactivate('object-id');

    // 객체 재활성화
    await this.s3ObjectScopeService.activate('object-id');

    return { activeObjects, userActiveObjects };
  }

  /**
   * 방법 3: Query Builder 사용
   * - 복잡한 쿼리에 적합
   * - 성능 최적화 가능
   */
  async exampleQueryBuilder() {
    // 활성화된 객체와 관계 데이터 조회
    const objectsWithRelations = await this.s3ObjectQueryService.findActiveWithRelations([
      'tags',
      'likes',
      'replies',
      'replies.user',
    ]);

    // 특정 ID의 활성화된 객체 조회
    const specificObject = await this.s3ObjectQueryService.findActiveById('object-id');

    // 사용자별 활성화된 객체 개수
    const userObjectCount = await this.s3ObjectQueryService.countActiveByUser('user-id');

    // 페이징 조회
    const paginatedObjects = await this.s3ObjectQueryService.findActiveWithPagination(
      1, // 페이지
      10, // 페이지당 개수
      ['tags', 'likes'], // 관계
    );

    return {
      objectsWithRelations,
      specificObject,
      userObjectCount,
      paginatedObjects,
    };
  }

  /**
   * 방법 4: Repository 패턴 사용
   * - Repository 클래스를 확장하여 사용
   * - 타입 안전성 보장
   */
  async exampleRepositoryPattern() {
    // Repository 패턴은 별도 파일에서 구현
    // s3-object.repository.ts 참조

    return {
      message: 'Repository 패턴 사용 예시는 s3-object.repository.ts 파일을 참조하세요.',
    };
  }
}

