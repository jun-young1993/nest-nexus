import {GithubConfig} from "./config.type";
import {IsString} from "class-validator";
import AppConfig from "./app.config";
import {registerAs} from "@nestjs/config";
import validateConfig from "../utils/validate-config";

class EnvironmentVariablesValidator {
    @IsString()
    GITHUB_ACCESS_TOKEN: GithubConfig['access_token']
}

export default registerAs<GithubConfig>('github',() => {
    validateConfig(process.env, EnvironmentVariablesValidator)
    return {
        access_token: process.env.GITHUB_ACCESS_TOKEN
    }
})