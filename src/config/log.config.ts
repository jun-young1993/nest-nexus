import { registerAs } from "@nestjs/config";
import { IsString } from "class-validator";
import { LogConfig } from "./config.type";
import validateConfig from "src/utils/validate-config";

class EnvironmentVariablesValidator {
	@IsString()
	LOG_DIR: LogConfig['dir']
}

export default registerAs<LogConfig>('log',() => {
	validateConfig(process.env, EnvironmentVariablesValidator);
	return {
		dir: process.env.LOG_DIR
	}
});