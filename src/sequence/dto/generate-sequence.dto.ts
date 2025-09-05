import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Int } from '@nestjs/graphql';

export class GenerateSequenceDto {
  @Field()
  @ApiProperty({ 
    description: '시퀀스명', 
    example: 'ORDER_NUMBER' 
  })
  @IsString()
  sequenceName: string;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ 
    description: '생성할 시퀀스 개수', 
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;
}
