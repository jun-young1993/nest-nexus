import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("openai_message")
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;  // 고유 ID

    @Column()
    role: string;  // role: 'assistant'

    @Column('text')
    content: string;  // message content

    @Column({ nullable: true, type: 'text' })
    refusal: string;  // refusal (nullable)

    static fromJson(json: any): Message {
        const message = new Message();
        message.role = json.role;
        message.content = json.content;
        message.refusal = json.refusal || null;

        return message;
    }
}