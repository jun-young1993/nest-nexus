import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { GithubContent } from './github-content.entity';

@Entity()
export class GithubContentTag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => GithubContent, (content) => content.tags)
    contents: GithubContent[];
}