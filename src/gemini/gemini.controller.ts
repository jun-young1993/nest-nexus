import { Controller, Get, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { GeminiSendMessageDto } from './dto/send-message.dto';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
	constructor(private readonly geminiService: GeminiService){}

	@Get('send-message')
	@ApiOperation({summary: 'gemini send message'})
	async sendMessage(@Query() {message}: GeminiSendMessageDto){
		console.log('message',message);
		return this.geminiService.sendMessage(message);
	}
}
