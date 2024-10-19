import {IsInt, IsNotEmpty, Min, Max, IsBoolean} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateFourPillarDto {
    @ApiProperty({
        example: 1993,
        description: 'The birth year',
        minimum: 1900,
        maximum: 2100,
    })
    @Transform(({ value }) => parseInt(value, 10))  // 문자열을 숫자로 변환
    @IsInt()
    @Min(1900)
    @Max(2100)
    @IsNotEmpty()
    year: number;

    @ApiProperty({
        example: 10,
        description: 'The birth month',
        minimum: 1,
        maximum: 12,
    })
    @Transform(({ value }) => parseInt(value, 10))  // 문자열을 숫자로 변환
    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    month: number;

    @ApiProperty({
        example: 15,
        description: 'The birth day',
        minimum: 1,
        maximum: 31,
    })
    @Transform(({ value }) => parseInt(value, 10))  // 문자열을 숫자로 변환
    @IsInt()
    @Min(1)
    @Max(31)
    @IsNotEmpty()
    day: number;

    @ApiProperty({
        example: 11,
        description: 'The birth hour (in 24-hour format)',
        minimum: 0,
        maximum: 23,
    })
    @Transform(({ value }) => parseInt(value, 10))  // 문자열을 숫자로 변환
    @IsInt()
    @Min(0)
    @Max(23)
    @IsNotEmpty()
    hour: number;

    // @ApiProperty({
    //     example: true,
    //     description: 'is lunar'
    // })
    // @IsBoolean()
    // isLunar: boolean;
}