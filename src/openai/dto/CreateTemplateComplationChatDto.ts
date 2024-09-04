import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTemplateComplationChatDto {
	@IsString()
	@ApiProperty({
		example: 'hi?'
	})
	message: string
}