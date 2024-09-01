import {IsNumber, IsOptional, IsString} from "class-validator";

export class CreateCodeItemDto {
    @IsString()
    key: string;

    @IsString()
    value: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNumber()
    code_id: number;

}