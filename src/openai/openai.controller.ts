import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AllConfigType } from 'src/config/config.type';
import { encrypt } from 'src/utils/crypto.util';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
	constructor(
		private readonly configService: ConfigService<AllConfigType>
	){}

	@Post('generate-token')
	@ApiOperation({ summary: 'Generate secure token' })
	generateToken() {
	    const currentTime = Date.now().toString();
	    const srcretKey = this.configService.getOrThrow('app.secret_key',{infer: true});
	    const token = encrypt(`${srcretKey}-${currentTime}`,srcretKey);
	    return { token };
	}

	@Post("send-message")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Open ai send message' })
	@ApiHeader({
		name: 'x-access-token',
		description: 'Authorization token',
		required: true,
	})
	sendMessage(){
		return 'test';
	}
}
