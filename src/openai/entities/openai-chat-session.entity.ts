import {Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ChatCompletion} from "./chat-completion.entity";

@Entity()
export class  OpenaiChatSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => ChatCompletion, (completion) => completion.session)
    completions: ChatCompletion[];
}