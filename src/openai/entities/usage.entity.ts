import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ChatCompletion } from './chat-completion.entity';

@Entity('openai_usage')
export class Usage {
  @PrimaryGeneratedColumn('uuid')
  id: string; // 고유 ID

  @Column()
  prompt_tokens: number; // prompt_tokens: 276

  @Column()
  completion_tokens: number; // completion_tokens: 766

  @Column()
  total_tokens: number; // total_tokens: 1042

  @OneToOne(() => ChatCompletion, (chatCompletion) => chatCompletion.usage)
  chatCompletion: ChatCompletion; // ChatCompletion과 다대일 관계

  static fromJson(json: any): Usage {
    const usage = new Usage();
    usage.prompt_tokens = json.prompt_tokens;
    usage.completion_tokens = json.completion_tokens;
    usage.total_tokens = json.total_tokens;

    return usage;
  }
}
