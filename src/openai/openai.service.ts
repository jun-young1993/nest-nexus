import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletion as OpenAIChatCompletion,
} from 'openai/resources';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatCompletion,
  ChatCompletionCodeItem,
} from './entities/chat-completion.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Choice } from './entities/choice.entity';
import { Message } from './entities/message.entity';
import { Usage } from './entities/usage.entity';
import { OpenaiChatSession } from './entities/openai-chat-session.entity';

@Injectable()
export class OpenaiService {
  private openAI: OpenAI;
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(ChatCompletion)
    private chatCompletionRepository: Repository<ChatCompletion>,
    @InjectRepository(Usage)
    private usageRepository: Repository<Usage>,
    @InjectRepository(OpenaiChatSession)
    private openaiChatSessionRepository: Repository<OpenaiChatSession>,
  ) {
    this.openAI = new OpenAI({
      organization: configService.get('gpt.organization', { infer: true }),
      project: configService.get('gpt.project_id', { infer: true }),
      apiKey: configService.get('gpt.key', { infer: true }),
    });
  }

  async chatCompletions(
    messages: ChatCompletionCreateParamsNonStreaming,
    session: OpenaiChatSession,
    options?: ChatCompletionCodeItem,
  ) {
    const completion = await this.openAI.chat.completions.create(messages);
    await this.saveCompletion(completion, session, options);
    return completion;
  }

  async saveCompletion(
    completionData: OpenAIChatCompletion | any,
    session: OpenaiChatSession,
    options?: ChatCompletionCodeItem,
  ): Promise<ChatCompletion> {
    const chatCompletion = ChatCompletion.fromJson(
      completionData,
      session,
      options,
    );
    const usage = await this.usageRepository.save(chatCompletion.usage);
    return this.chatCompletionRepository.save({
      ...chatCompletion,
      usage: usage,
    });
  }

  async findOne(uuid: string): Promise<ChatCompletion | null> {
    return this.chatCompletionRepository.findOne({
      relations: ['choices', 'choices.message', 'usage'],
      where: {
        id: uuid,
      },
    });
  }

  async findOneBySessionOrFail(
    uuid: string,
    where?: FindOptionsWhere<OpenaiChatSession>,
  ) {
    const result = await this.findOneBySession(uuid, where);
    if (result == null) {
      throw new NotFoundException(`ChatCompletion with UUID ${uuid} not found`);
    }
    return result;
  }

  async findOneBySession(
    uuid: string,
    where?: FindOptionsWhere<OpenaiChatSession>,
  ): Promise<OpenaiChatSession | null> {
    console.log({
      relations: [
        'completions',
        'completions.choices',
        'completions.choices.message',
        'completions.usage',
        'completions.systemPromptCodeItem',
        'completions.userPromptCodeItem',
      ],
      where: {
        ...where,
        id: uuid,
      },
    });
    return this.openaiChatSessionRepository.findOne({
      relations: [
        'completions',
        'completions.choices',
        'completions.choices.message',
        'completions.usage',
        'completions.systemPromptCodeItem',
        'completions.userPromptCodeItem',
      ],
      where: {
        ...where,
        id: uuid,
      },
    });
  }

  async findOneOrFail(uuid: string): Promise<ChatCompletion> {
    const chatCompletion = await this.findOne(uuid);
    if (chatCompletion == null) {
      throw new NotFoundException(`ChatCompletion with UUID ${uuid} not found`);
    }
    return chatCompletion;
  }

  async saveSession(): Promise<OpenaiChatSession> {
    return this.openaiChatSessionRepository.save(
      this.openaiChatSessionRepository.create(),
    );
  }
}
