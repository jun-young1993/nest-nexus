import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ChatCompletion } from './chat-completion.entity';
import { Message } from './message.entity';

@Entity("openai_choice")
export class Choice {
    @PrimaryGeneratedColumn('uuid')
    id: string;  // 고유 ID

    @Column()
    index: number;  // index: 0

    @ManyToOne(() => Message, { cascade: true })
    message: Message;  // message는 Message 엔티티로 매핑

    @Column({ nullable: true })
    finish_reason: string;  // finish_reason: 'stop'

    @ManyToOne(() => ChatCompletion, (chatCompletion) => chatCompletion.choices)
    chatCompletion: ChatCompletion;  // ChatCompletion과 다대일 관계

    static fromJson(json: any): Choice {
        const choice = new Choice();
        choice.index = json.index;
        choice.message = Message.fromJson(json.message);
        choice.finish_reason = json.finish_reason || null;

        return choice;
    }
}