import { Body, Controller, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CodeItemService } from 'src/code-item/code-item.service';
import { AllConfigType } from 'src/config/config.type';
import { encrypt } from 'src/utils/crypto.util';
import { CreateTemplateComplationChatDto } from './dto/CreateTemplateComplationChatDto';
import { OpenaiService } from './openai.service';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
	constructor(
		private readonly configService: ConfigService<AllConfigType>,
		private readonly codeItemService: CodeItemService,
		private readonly openaiService: OpenaiService
	){}

	@Post('generate-token')
	@ApiOperation({ summary: 'Generate secure token' })
	generateToken() {
	    const currentTime = Date.now().toString();
	    const srcretKey = this.configService.getOrThrow('app.secret_key',{infer: true});
	    const token = encrypt(`${srcretKey}-${currentTime}`,srcretKey);
	    return { token };
	}

	@Post("send-message/:template_code")
	@ApiBearerAuth()
	@ApiBody({ type: CreateTemplateComplationChatDto})
	@ApiParam({ name: 'template_code', description: 'ID of the code item to retrieve' })
	@ApiOperation({ summary: 'Open ai send message' })
	@ApiHeader({
		name: 'x-access-token',
		description: 'Authorization token',
		required: true,
	})
	async sendMessage(
		@Param('template_code') templateCode: string,
		@Body() {message} : CreateTemplateComplationChatDto
	){
		const templateCodeItem = await this.codeItemService.findOneByCodeAndKey('prompt_template',templateCode);
		// await this.openaiService.chatCompletions({
		// 	messages: [
		// 	    {
		// 		role: "system",
		// 		content: templateCodeItem.value
		// 	    },
		// 	    {
		// 		role: "user",
		// 		content: message
		// 	    }
		// 	],
		// 	model: 'gpt-4o'
		//     });
		console.log(templateCodeItem);
		console.log(templateCode);
		console.log(CreateTemplateComplationChatDto);
		return CreateTemplateComplationChatDto;
	}
}
