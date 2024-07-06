import { registerAs } from "@nestjs/config";
import { AppConfig } from "./config.type";
import validateConfig from "src/utils/validate-config";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

class EnvironmentVariablesValidator {

	@IsString()
	@IsOptional()
	APP_PORT: AppConfig['port']

	@IsString()
	@IsOptional()
	APP_HOST: AppConfig['host']

	@IsString()
	@IsOptional()
	HTTP_SSL_KEY: AppConfig['ssl_key']

	@IsString()
	@IsOptional()
	HTTP_SSL_CERT: AppConfig['ssl_cert']

	@IsString()
	LOG_DIR: AppConfig['log_dir']
}

export default registerAs<AppConfig>('app',()=>{
	validateConfig(process.env, EnvironmentVariablesValidator);
	return {
		host: process.env.APP_HOST,
		port: process.env.APP_PORT
		? parseInt(process.env.APP_PORT, 10)
		: process.env.PORT
		  ? parseInt(process.env.PORT, 10)
		  : 3000,
		ssl_cert: process.env.HTTP_SSL_KEY,
		ssl_key: process.env.HTTP_SSL_CERT,
		log_dir: process.env.LOG_DIR
	}
});

