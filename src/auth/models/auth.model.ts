import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType('LoginInputModel')
export class LoginInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;
}

@ObjectType()
export class AuthResponse {
    @Field()
    accessToken: string;
}