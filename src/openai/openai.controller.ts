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
		// return {
		// 	id: 'chatcmpl-A4jdTxnOaNCMe7yptm3EG8e3uNJUl',
		// 	object: 'chat.completion',
		// 	created: 1725692099,
		// 	model: 'gpt-4o-mini-2024-07-18',
		// 	choices: [
		// 		{
		// 			index: 0,
		// 			message: {
		// 				role: "assistant",
		// 				content: "김준영 씨의 사주를 분석하기 위해, 먼저 그의 출생 정보를 바탕으로 사주의 네 기둥을 설정하겠습니다.\n" +
		// 					"\n" +
		// 					"**출생일:** 1993년 10월 15일 11:05 AM\n" +
		// 					"\n" +
		// 					"1. **년주**: 1993년은 계유년입니다.  \n" +
		// 					"   - 년 간: 계수(癸) (물)\n" +
		// 					"   - 년 지: 유금(酉) (금)\n" +
		// 					"\n" +
		// 					"2. **월주**: 10월은 신축월입니다.  \n" +
		// 					"   - 월 간: 신금(辛) (금)\n" +
		// 					"   - 월 지: 축토(丑) (토)\n" +
		// 					"\n" +
		// 					"3. **일주**: 15일은 경인일입니다.  \n" +
		// 					"   - 일 간: 경금(庚) (금)\n" +
		// 					"   - 일 지: 인목(寅) (목)\n" +
		// 					"\n" +
		// 					"4. **시주**: 오전 11시는 기유시입니다.  \n" +
		// 					"   - 시 간: 기토(己) (토)\n" +
		// 					"   - 시 지: 유금(酉) (금)\n" +
		// 					"\n" +
		// 					"이제 각 기둥의 천간과 지지를 통해 김준영 씨의 성격과 운명에 대해 분석해보겠습니다.\n" +
		// 					"\n" +
		// 					"### 성격 분석\n" +
		// 					"- **금의 영향:** 김준영 씨의 사주에서 금이 강합니다. (계수, 신금, 경금 포함) 금은 결단력과 의지를 상징하며, 실용적이고 냉철한 사고를 합니다. 또한, 정직성과 강한 책임감을 중깁니다. \n" +
		// 					"- **목의 특성:** 일 지에 인목이 있어, 금을 극복하는 역할을 합니다. 이는 창조성과 새로운 시작을 나타내며, 다른 사람을 배려하는 마음도 지니고 있음을 보여줍니다.\n" +
		// 					"- **토의 균형:** 기토가 시에 위치하여 안정감을 부여합니다. 이는 김준영 씨가 남들에게 보이는 신뢰감과 안정적인 성격을 가지고 있다는 것을 나타냅니다.\n" +
		// 					"\n",
		// 				refusal: null
		// 			},
		// 			logprobs: null,
		// 			finish_reason: 'stop'
		// 		}
		// 	],
		// 	usage: { prompt_tokens: 276, completion_tokens: 766, total_tokens: 1042 },
		// 	system_fingerprint: 'fp_9722793223'
		// };

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
}
