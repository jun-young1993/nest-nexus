
import { IsOptional, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateCodeDto {
    @IsString()
    @ApiProperty({
        example: 'test_code'
    })
    code: string;

    @ApiProperty({
        example: 'test_code_name'
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'test_code_description'
    })
    @IsOptional()
    @IsString()
    description?: string;
}
