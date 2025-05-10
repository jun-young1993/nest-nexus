import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('goal')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;
}
