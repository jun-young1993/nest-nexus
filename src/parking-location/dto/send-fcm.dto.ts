import { ApiProperty } from '@nestjs/swagger';

export class SendFcmDto {
  @ApiProperty({ description: '목적 사람 아이디' })
  targetCarNumberId: string;

  @ApiProperty({ description: '보내는 사람 아이디' })
  senderCarNumberId: string;

  @ApiProperty({ description: '메시지' })
  message: string;
}
