import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { S3Object } from './entities/s3-object.entity';

@Injectable()
export class S3ObjectRepository extends Repository<S3Object> {
  constructor(private dataSource: DataSource) {
    super(S3Object, dataSource.createEntityManager());
  }

  /**
   * 활성화된 S3Object만 조회하는 글로벌 스코프 메서드들
   */
  async findActive(options?: any): Promise<S3Object[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  async findOneActive(options?: any): Promise<S3Object | null> {
    return this.findOne({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  async findOneActiveOrFail(options?: any): Promise<S3Object> {
    return this.findOneOrFail({
      ...options,
      where: {
        ...options?.where,
        active: true,
      },
    });
  }

  async countActive(options?: any): Promise<number> {
    return this.count({
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
  async findIncludingInactive(options?: any): Promise<S3Object[]> {
    return this.find(options);
  }

  async findOneIncludingInactive(options?: any): Promise<S3Object | null> {
    return this.findOne(options);
  }
}

