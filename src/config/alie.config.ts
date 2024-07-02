import { registerAs } from "@nestjs/config";
import { AlieConfig } from "./config.type";
import { IsString } from "class-validator";
import validateConfig from "src/utils/validate-config";

class EnviromentVariablesValidator {

	@IsString()
	ALIE_API_URL: AlieConfig['url']

	@IsString()
	ALIE_AUTH_CALLBACK_URL: AlieConfig['auth_callback_url']

	@IsString()
	ALIE_APP_KEY: AlieConfig['app_key']
}

export default registerAs<AlieConfig>('alie',()=>{
	validateConfig(process.env, EnviromentVariablesValidator);
	return {
		url: process.env.ALIE_API_URL,
		auth_callback_url: process.env.ALIE_AUTH_CALLBACK_URL,
		app_key: process.env.ALIE_APP_KEY
	}
})