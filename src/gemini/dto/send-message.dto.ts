import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GeminiSendMessageDto {
	@ApiProperty({
		description: 'send message',
		example: 'hi? my name is junyoung'
	})
	@IsString()
	message: string;
}