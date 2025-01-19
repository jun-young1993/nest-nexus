import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import {Post} from "./post.entity";


@Entity()
export class PostTag {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];
}