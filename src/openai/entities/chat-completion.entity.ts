import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
    PrimaryColumn, ManyToOne
} from 'typeorm';
import { Choice } from './choice.entity';
import { Usage } from './usage.entity';
import {OpenaiChatSession} from "./openai-chat-session.entity";

@Entity("openai_chat_completion")
export class ChatCompletion {
    @PrimaryColumn({type: 'varchar', length: 255})
    id: string;  // chatcmpl-A4jdTxnOaNCMe7yptm3EG8e3uNJUl 와 같은 고유 id

    @Column()
    object: string;  // chat.completion

    @CreateDateColumn({ type: 'timestamp' })
    created: Date;  // created: 1725692099

    @Column()
    model: string;  // gpt-4o-mini-2024-07-18

    @OneToMany(() => Choice, (choice) => choice.chatCompletion, { cascade: true })
    choices: Choice[];

    @OneToOne(() => Usage, (usage) => usage.chatCompletion, { cascade: true })
    @JoinColumn()
    usage: Usage;

    @ManyToOne(() => OpenaiChatSession, (session) => session.completions)
    session: OpenaiChatSession;

    static fromJson(json: any): ChatCompletion {
        const chatCompletion = new ChatCompletion();
        chatCompletion.id = json.id;
        chatCompletion.object = json.object;
        chatCompletion.created = new Date(json.created * 1000); // 유닉스 타임스탬프 변환
        chatCompletion.model = json.model;

        chatCompletion.choices = json.choices.map((choice: any) => Choice.fromJson(choice));
        chatCompletion.usage = Usage.fromJson(json.usage);

        return chatCompletion;
    }
}