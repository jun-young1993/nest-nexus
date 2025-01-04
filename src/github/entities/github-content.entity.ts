import {Entity, Column, PrimaryColumn, ManyToMany, JoinTable} from 'typeorm';
import {GithubContentTag} from "./github-content-tag.entity";

@Entity()
export class GithubContent {
    @PrimaryColumn()
    sha: string; // GitHub API에서 제공하는 SHA 값 사용

    @Column()
    repository: string;

    @Column()
    filename: string;

    @Column({ type: 'text' })
    content: string;

    @Column()
    path: string;

    @Column({ type: 'timestamp' })
    createdAt: Date; // GitHub 파일 생성 시간

    @Column({ type: 'timestamp' })
    updatedAt: Date; // GitHub 파일 수정 시간

    @ManyToMany(() => GithubContentTag, (tag) => tag.contents, { cascade: true })
    @JoinTable()
    tags: GithubContentTag[];
}