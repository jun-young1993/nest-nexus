import {Injectable, NotFoundException} from '@nestjs/common';
import OpenAI from "openai";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";
import {ChatCompletionCreateParamsNonStreaming, ChatCompletion as OpenAIChatCompletion} from "openai/resources";
import {InjectRepository} from "@nestjs/typeorm";
import {ChatCompletion} from "./entities/chat-completion.entity";
import {Repository} from "typeorm";
import {Choice} from "./entities/choice.entity";
import {Message} from "./entities/message.entity";
import {Usage} from "./entities/usage.entity";
import {OpenaiChatSession} from "./entities/openai-chat-session.entity";



@Injectable()
export class OpenaiService {
    private openAI: OpenAI;
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        @InjectRepository(ChatCompletion)
        private chatCompletionRepository: Repository<ChatCompletion>,
        @InjectRepository(OpenaiChatSession)
        private openaiChatSessionRepository: Repository<OpenaiChatSession>,
    ) {
        this.openAI = new OpenAI({
            organization: configService.get('gpt.organization',{infer: true}),
            project: configService.get('gpt.project_id',{infer: true}),
            apiKey: configService.get('gpt.key',{infer: true})
        });
    }

    async chatCompletions(messages: ChatCompletionCreateParamsNonStreaming){
        const completion = await this.openAI.chat.completions.create(messages);
        await this.saveCompletion(completion);
        return completion;
    }

    async saveCompletion(completionData: OpenAIChatCompletion | any): Promise<ChatCompletion> {
        const chatCompletion = ChatCompletion.fromJson(completionData);
        return this.chatCompletionRepository.save(chatCompletion);
    }

    async findOne(uuid: string):  Promise<ChatCompletion | null> {
        return this.chatCompletionRepository.findOne({
            relations: [
                'choices',
                'choices.message',
                'usage'
            ],
            where: {
                id: uuid
            }
        });
    }

    async findOneOrFail(uuid: string) : Promise<ChatCompletion> {
        const chatCompletion = await this.findOne(uuid);
        if(chatCompletion == null){
            throw new NotFoundException(`ChatCompletion with UUID ${uuid} not found`);
        }
        return chatCompletion;
    }

    async saveSession(): Promise<OpenaiChatSession>
    {
        return this.openaiChatSessionRepository.save(
            this.openaiChatSessionRepository.create()
        );
    }


}
