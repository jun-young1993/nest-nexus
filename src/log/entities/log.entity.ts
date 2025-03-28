import { LogGroup } from 'src/log-group/entities/log-group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  logGroupId: string;

  @ManyToOne(() => LogGroup, (logGroup) => logGroup.logs)
  logGroup: LogGroup;
}
