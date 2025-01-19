import {Entity, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import {PostTag} from "./post-tag.entity";
import {User} from "../../user/entities/user.entity";


@Entity()
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToMany(() => PostTag, (tag) => tag.posts, { cascade: true })
    @JoinTable()
    tags: PostTag[];

    @ManyToOne(() => User, (user) => user.posts, { nullable: false })
    author: User; // 작성자 (User와의 관계)
}