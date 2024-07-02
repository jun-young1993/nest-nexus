import { registerAs } from "@nestjs/config";
import { AppConfig } from "./config.type";
import validateConfig from "src/utils/validate-config";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

class EnviromentVariablesValidator {

	@IsString()
	@IsOptional()
	APP_PORT: AppConfig['port']

	@IsString()
	APP_HOST: AppConfig['host']
}

export default registerAs<AppConfig>('app',()=>{
	validateConfig(process.env, EnviromentVariablesValidator);
	return {
		host: process.env.APP_HOST,
		port: process.env.APP_PORT
		? parseInt(process.env.APP_PORT, 10)
		: process.env.PORT
		  ? parseInt(process.env.PORT, 10)
		  : 3000
	}
});