import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { S3Object } from './entities/s3-object.entity';

/**
 * S3Object 엔티티의 글로벌 스코프를 처리하는 서비스
 */
@Injectable()
export class S3ObjectScopeService {
  constructor(
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  /**
   * 활성화된 객체만 조회하는 기본 메서드들
   */
  async findActive(options?: any): Promise<S3Object[]> {
    return this.s3ObjectRepository.find({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  async findOneActive(options?: any): Promise<S3Object | null> {
    return this.s3ObjectRepository.findOne({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  async findOneActiveOrFail(options?: any): Promise<S3Object> {
    return this.s3ObjectRepository.findOneOrFail({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  /**
   * 비활성화된 객체도 포함하여 조회 (관리자용)
   */
  async findAllIncludingInactive(options?: any): Promise<S3Object[]> {
    return this.s3ObjectRepository.find(options);
  }

  /**
   * 객체 비활성화 (Soft Delete 대신 active 필드 사용)
   */
  async deactivate(id: string): Promise<void> {
    await this.s3ObjectRepository.update(id, { active: false });
  }

  /**
   * 객체 재활성화
   */
  async activate(id: string): Promise<void> {
    await this.s3ObjectRepository.update(id, { active: true });
  }

  /**
   * 활성화 상태 토글
   */
  async toggleActive(id: string): Promise<S3Object> {
    const s3Object = await this.s3ObjectRepository.findOne({ where: { id } });
    if (!s3Object) {
      throw new Error('S3Object not found');
    }
    
    s3Object.active = !s3Object.active;
    return this.s3ObjectRepository.save(s3Object);
  }
}

/**
 * S3Object 엔티티 이벤트 리스너
 * 삽입/업데이트 시 자동으로 active 상태를 관리
 */
@EventSubscriber()
export class S3ObjectSubscriber implements EntitySubscriberInterface<S3Object> {
  listenTo() {
    return S3Object;
  }

  beforeInsert(event: InsertEvent<S3Object>) {
    // 새로 생성되는 객체는 기본적으로 활성화
    if (event.entity.active === undefined) {
      event.entity.active = true;
    }
  }

  beforeUpdate(event: UpdateEvent<S3Object>) {
    // 업데이트 시 active 상태가 변경되면 로그 기록
    if (event.entity && event.databaseEntity) {
      const oldActive = event.databaseEntity.active;
      const newActive = event.entity.active;
      
      if (oldActive !== newActive) {
        console.log(`S3Object ${event.entity.id} active status changed: ${oldActive} -> ${newActive}`);
      }
    }
  }
}

