import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 상환 상태 정보 DTO
 */
@ObjectType()
export class PaymentStatusInfo {
  /**
   * 상환 상태 키 (enum 값)
   */
  @ApiProperty({ description: '상환 상태 키 (enum 값)' })
  @Field()
  key: string;

  /**
   * 상환 상태 한글명
   */
  @ApiProperty({ description: '상환 상태 한글명' })
  @Field()
  value: string;

  /**
   * 상환 상태 설명
   */
  @ApiProperty({ description: '상환 상태 설명' })
  @Field()
  description: string;
}
