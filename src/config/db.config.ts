import {IsNumber, IsPort, IsSemVer, IsString} from "class-validator";
import {DbConfig} from "./config.type";
import {registerAs} from "@nestjs/config";
import validateConfig from "../utils/validate-config";


class EnvironmentVariablesValidator {
    @IsString()
    DB_HOST: DbConfig['host']
    @IsPort()
    DB_PORT: DbConfig['port']
    @IsString()
    DB_USER: DbConfig['username']
    @IsString()
    DB_PASS: DbConfig['password']
    @IsString()
    DB_DATABASE: DbConfig['database']
}

export default registerAs<DbConfig>('db',() => {
    validateConfig(process.env, EnvironmentVariablesValidator);
    return {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE
    }
})