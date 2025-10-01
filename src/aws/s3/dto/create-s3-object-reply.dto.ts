import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateS3ObjectReplyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '댓글 내용',
    example: '댓글 내용',
    maxLength: 1000,
  })
  @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
  content: string;

  static fromJson(json: any): CreateS3ObjectReplyDto {
    return plainToInstance(CreateS3ObjectReplyDto, json);
  }
}
