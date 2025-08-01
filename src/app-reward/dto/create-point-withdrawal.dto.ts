import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePointWithdrawalDto {
  @ApiProperty({ description: '사용자 포인트 잔액 ID' })
  @IsString()
  @IsNotEmpty()
  userPointBalanceId: string;

  @ApiProperty({ description: '사용자 ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '은행명' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: '계좌번호' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ description: '예금주' })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @ApiProperty({ description: '출금 금액 (포인트)' })
  @IsNumber()
  @Min(1)
  withdrawalAmount: number;
}
