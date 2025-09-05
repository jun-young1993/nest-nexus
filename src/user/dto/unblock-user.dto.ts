import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field } from '@nestjs/graphql';

export class UnblockUserDto {
  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '블록 해제 사유', 
    example: '사과를 받아들임' 
  })
  @IsOptional()
  @IsString()
  unblockReason?: string;
}
