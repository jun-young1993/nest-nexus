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

	@IsString()
	ALIE_APP_SECRET: AlieConfig['app_secret']

	@IsString()
	ALIE_ACCESS_TOKEN: AlieConfig['access_token']
}

export default registerAs<AlieConfig>('alie',()=>{
	validateConfig(process.env, EnviromentVariablesValidator);
	return {
		url: process.env.ALIE_API_URL,
		auth_callback_url: process.env.ALIE_AUTH_CALLBACK_URL,
		app_key: process.env.ALIE_APP_KEY,
		app_secret: process.env.ALIE_APP_SECRET,
		access_token: process.env.ALIE_ACCESS_TOKEN
	}
})