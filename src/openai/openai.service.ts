import { Injectable } from '@nestjs/common';
import OpenAI from "openai";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";
import {ChatCompletionCreateParamsNonStreaming} from "openai/resources";


@Injectable()
export class OpenaiService {
    private openAI: OpenAI;
    constructor(
        private readonly configService: ConfigService<AllConfigType>
    ) {
        this.openAI = new OpenAI({
            organization: configService.get('gpt.organization',{infer: true}),
            project: configService.get('gpt.project_id',{infer: true}),
            apiKey: configService.get('gpt.key',{infer: true})
        });
    }

    async chatCompletions(messages: ChatCompletionCreateParamsNonStreaming){
        const completion = await this.openAI.chat.completions.create(messages);
        return completion;
    }
}
