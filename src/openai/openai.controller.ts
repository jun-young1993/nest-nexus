import {Body, Controller, Get, NotFoundException, Param, Post, Query} from '@nestjs/common';
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
import {ChatCompletionMessageParam} from "openai/resources";
import {Between, FindOptionsWhere} from "typeorm";
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
	@Post("send-message/:system_prompt_code/:user_prompt_code/:model_code/:session_id")
	@ApiBearerAuth()
	@ApiBody({ type: CreateTemplateComplationChatDto})
	@ApiParam({ name: 'system_prompt_code', description: 'ID of the code item to retrieve', example: 'four_pillars_of_destiny' })
	@ApiParam({ name: 'user_prompt_code', description: 'ID of the code item to retrieve', example: 'fourPillarsOfDestiny' })
	@ApiParam({ name: 'model_code', description: 'ID of the code item to retrieve', example: 'saju-base'})
	@ApiParam({ name: 'session_id', description: 'ID of the code item to retrieve', example: 'fe10c0ec-8480-45e6-9f5b-f44cebfdabfb'})
	@ApiOperation({ summary: 'Open ai send message' })
	@ApiHeader({
		name: 'x-access-token',
		description: 'Authorization token',
		required: true,
	})
	async sendMessage(
		@Param('system_prompt_code') systemPromptCode: string,
		@Param('user_prompt_code') userPromptCode: string,
		@Param('model_code') modelCode: string,
		@Param('session_id') sessionId: string,
		@Body() {messages} : CreateTemplateComplationChatDto
	){
		const session = await this.openaiService.findOneBySession(sessionId);
		const modelCodeItem = await this.codeItemService.findOneByCodeAndKey('openai-model',modelCode);
		const systemPromptCodeItem = await this.codeItemService.findOneByCodeAndKey('system-prompt-template',systemPromptCode);
		const userPromptCodeItem = await this.codeItemService.findOneByCodeAndKey('user-prompt-template',userPromptCode);
		console.log(modelCodeItem);
		console.log(systemPromptCodeItem);
		console.log(userPromptCodeItem);
		console.log(session);
		console.log(messages);

		const messageParams = messages.map((message) => {
			return {role: message.role, content: message.content}
		}) as ChatCompletionMessageParam[];

		const result = await this.openaiService.chatCompletions(
			{
				messages: [
				{
					role: "system",
					content: systemPromptCodeItem.value
				},
				...messageParams,
				{
					role: 'user',
					content: userPromptCodeItem.value
				}
				],
				model: modelCodeItem.value
			},
			session,
			{
				systemPromptCodeItem: systemPromptCodeItem,
				userPromptCodeItem: userPromptCodeItem
			}
		);

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

	@Get('chat-completion/session/:uuid')
	@ApiOperation({ summary: 'Retrieve a chat completion by UUID' })  // API 엔드포인트 설명
	// @ApiQuery({ name: 'uuid', required: true, description: 'a chat completion by UUID' })
	@ApiParam({ name: 'uuid', description: 'The UUID of the ChatCompletion entity' })  // 경로 파라미터 설명
	@ApiQuery({name: 'system_prompt_code_item_key', required: false, description: 'Optional system prompt code filter'})
	@ApiQuery({name: 'user_prompt_code_item_key', required: false, description: 'Optional system prompt code filter'})
	@ApiQuery({name: 'start_date', required: false, description: 'created start date'})
	@ApiQuery({name: 'end_date', required: false, description: 'created end date'})
	@ApiResponse({ status: 200, description: 'Successfully retrieved the chat completion.', type: ChatCompletion })  // 성공 시 응답 설명
	@ApiResponse({ status: 404, description: 'ChatCompletion not found.' })  // 실패 시 응답 설명
	async findOneBySession(
		@Param('uuid') uuid: string,
		@Query('system_prompt_code_item_key') systemPromptCodeItemKey?: string,
		@Query('user_prompt_code_item_key') userPromptCodeItemKey?: string,
		@Query('start_date') startDate?: String,
		@Query('end_date') endDate?: String
	): Promise<OpenaiChatSession | null> {
		
		const where: FindOptionsWhere<OpenaiChatSession> = {
			completions: {
				...(
					systemPromptCodeItemKey &&
					{
						systemPromptCodeItem: await this.codeItemService.findOneByCodeAndKey('system-prompt-template',systemPromptCodeItemKey)
					}
				),
				...(
					userPromptCodeItemKey &&
					{
						userPromptCodeItem: await this.codeItemService.findOneByCodeAndKey('user-prompt-template',userPromptCodeItemKey)
					}
				),
				...(
					startDate && endDate &&
					{
						created: Between(new Date(startDate.toString()), new Date(endDate.toString()))
					}
				)
			}
		};

		
		return await this.openaiService.findOneBySession(uuid, where);
	}

	@ApiOperation({ summary: 'Create Chat Completion Session' })  // API 엔드포인트 설명
	@Post("session")
	async createSession(): Promise<OpenaiChatSession>{
		return this.openaiService.saveSession();
	}
}
