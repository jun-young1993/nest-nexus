import { CodeItem } from 'src/code-item/entities/code-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('code')
export class Code {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({
        default: null,
        nullable: true,
    })
    description?: string;

    @OneToMany(() => CodeItem, (codeItem) => codeItem.code)
    codeItems: CodeItem[];

}