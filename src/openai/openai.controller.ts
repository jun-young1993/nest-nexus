import {Body, Controller, Get, NotFoundException, Param, Post} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	ApiBearerAuth,
	ApiBody,
	ApiHeader,
	ApiOperation,
	ApiParam, ApiQuery,
	ApiResponse,
	ApiSecurity,
	ApiTags
} from '@nestjs/swagger';
import { CodeItemService } from 'src/code-item/code-item.service';
import { AllConfigType } from 'src/config/config.type';
import { encrypt } from 'src/utils/crypto.util';
import { CreateTemplateComplationChatDto } from './dto/CreateTemplateComplationChatDto';
import { OpenaiService } from './openai.service';
import {ChatCompletion} from "./entities/chat-completion.entity";
import {OpenaiChatSession} from "./entities/openai-chat-session.entity";

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
	 * @param {string} templateCode
	 * @param {CreateTemplateComplationChatDto} {message}
	 * @returns {Promise<ChatCompletion>}
	 * @memberof OpenaiController
	 */
	@Post("send-message/:template_code/:model_code")
	@ApiBearerAuth()
	@ApiBody({ type: CreateTemplateComplationChatDto})
	@ApiParam({ name: 'template_code', description: 'ID of the code item to retrieve' })
	@ApiParam({ name: 'model_code', description: 'ID of the code item to retrieve' })
	@ApiOperation({ summary: 'Open ai send message' })
	@ApiHeader({
		name: 'x-access-token',
		description: 'Authorization token',
		required: true,
	})
	async sendMessage(
		@Param('template_code') templateCode: string,
		@Param('model_code') modelCode: string,
		@Body() {message} : CreateTemplateComplationChatDto
	){

		const modelCodeItem = await this.codeItemService.findOneByCodeAndKey('openai-model',modelCode);
		const templateCodeItem = await this.codeItemService.findOneByCodeAndKey('prompt_template',templateCode);

		const result = await this.openaiService.chatCompletions({
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
			model: modelCodeItem.value
		});
		console.log(result);
		console.log(result.choices[0].message.content);
		return result;
	}

	@Get('chat-completion/:uuid')
	@ApiOperation({ summary: 'Retrieve a chat completion by UUID' })  // API 엔드포인트 설명
	// @ApiQuery({ name: 'uuid', required: true, description: 'a chat completion by UUID' })
	@ApiParam({ name: 'uuid', description: 'The UUID of the ChatCompletion entity' })  // 경로 파라미터 설명
	@ApiResponse({ status: 200, description: 'Successfully retrieved the chat completion.', type: ChatCompletion })  // 성공 시 응답 설명
	@ApiResponse({ status: 404, description: 'ChatCompletion not found.' })  // 실패 시 응답 설명
	async findOne(
		@Param('uuid') uuid: string,
	): Promise<ChatCompletion> {
		return await this.openaiService.findOneOrFail(uuid);
	}

	@ApiOperation({ summary: 'Create Chat Completion Session' })  // API 엔드포인트 설명
	@Post("session")
	async createSession(): Promise<OpenaiChatSession>{
		return this.openaiService.saveSession();
	}
}
