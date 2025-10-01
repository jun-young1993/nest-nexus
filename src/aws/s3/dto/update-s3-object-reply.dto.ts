import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateS3ObjectReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
  content: string;
}
