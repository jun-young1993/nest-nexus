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
	
	/**
	 *
	 *
	 * @param {string} templateCode
	 * @param {CreateTemplateComplationChatDto} {message}
	 * @returns {Promise<ChatCompletion>}
	 * @memberof OpenaiController
	 * @example
	 * ```json
	 * {
	 * "id": "chatcmpl-A3ycy83HOD7iN3PigM1qepY66iRFH",
	 * "object": "chat.completion",
	 * "created": 1725511400,
	 * "model": "gpt-4o-2024-05-13",
	 * "choices": [
	 *   {
	 *     "index": 0,
	 *     "message": {
	 *       "role": "assistant",
	 *       "content": "Hello! How can I assist you today?",
	 *       "refusal": null
	 *     },
	 *     "logprobs": null,
	 *     "finish_reason": "stop"
	 *   }
	 * ],
	 * "usage": {
	 *   "prompt_tokens": 13,
	 *   "completion_tokens": 9,
	 *   "total_tokens": 22
	 * },
	 * "system_fingerprint": "fp_157b3831f5"
	 *}
	 * ```
	 */
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
		
		return await this.openaiService.chatCompletions({
			messages: [
			    {
				role: "system",
				content: templateCodeItem.value
			    },
			    {
				role: "user",
				content: message
			    }
			],
			model: 'gpt-4o'
		    });
	}
}
