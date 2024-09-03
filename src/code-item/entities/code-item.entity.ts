import { Code } from 'src/code/entities/code.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { IsEnum } from 'class-validator';
import {IS_DELETED} from "../../typeorm/interfaces/typeorm.interface";

@Entity()
export class CodeItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column({
        type: 'longtext',
    })
    value: string;

    @Column({
        default: null,
        nullable: true,
    })
    description?: string;

    @Column({
        name: 'is_deleted',
        type: 'varchar',
        length: 1,
        default: IS_DELETED.N,
    })
    @IsEnum(IS_DELETED)
    public isDeleted: IS_DELETED;

    @ManyToOne(() => Code, (code) => code.codeItems)
    @JoinColumn({ name: 'code_id' })
    code: Code;

    @Column({
        default: 0,
    })
    order: number;


}