import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Int } from '@nestjs/graphql';

export class CreateSequenceDto {
  @Field()
  @ApiProperty({ 
    description: '시퀀스명', 
    example: 'ORDER_NUMBER',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sequenceName: string;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ 
    description: '초기 시퀀스 번호', 
    example: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequenceNumber?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '시퀀스 설명', 
    example: '주문 번호 생성용 시퀀스' 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '시퀀스 접두사', 
    example: 'ORD',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefix?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '시퀀스 접미사', 
    example: '-2024',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  suffix?: string;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ 
    description: '시퀀스 패딩 길이', 
    example: 6,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  paddingLength?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ 
    description: '시퀀스 활성화 여부', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
