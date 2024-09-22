import {Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ChatCompletion} from "./chat-completion.entity";

@Entity()
export class  OpenaiChatSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => ChatCompletion, (completion) => completion.session)
    completions: ChatCompletion;
}