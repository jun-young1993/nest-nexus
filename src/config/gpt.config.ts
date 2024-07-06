import {GptConfig} from "./config.type";
import {IsString} from "class-validator";
import {registerAs} from "@nestjs/config";
import validateConfig from "../utils/validate-config";

class EnvironmentVariablesValidator {
    @IsString()
    GPT_ORGANIZATION: GptConfig['organization']
    @IsString()
    GPT_KEY: GptConfig['key']
    @IsString()
    GPT_PROJECT_ID: GptConfig['project_id']
}

export default registerAs<GptConfig>('gpt', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);
    return {
        organization: process.env.GPT_ORGANIZATION,
        key: process.env.GPT_KEY,
        project_id: process.env.GPT_PROJECT_ID
    }
});