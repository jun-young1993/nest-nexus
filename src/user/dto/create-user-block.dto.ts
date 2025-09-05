import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field } from '@nestjs/graphql';
import { BlockStatus } from '../entities/user-block.entity';

export class CreateUserBlockDto {
  @Field()
  @ApiProperty({ 
    description: '블록당한 사용자 ID', 
    example: 'e014a203-47e6-4f0f-b2d0-d459a108ce57' 
  })
  @IsUUID()
  blockedId: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '블록 사유', 
    example: '부적절한 댓글 작성' 
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '블록 상태', 
    enum: BlockStatus, 
    default: BlockStatus.ACTIVE 
  })
  @IsOptional()
  @IsEnum(BlockStatus)
  status?: BlockStatus;
}
