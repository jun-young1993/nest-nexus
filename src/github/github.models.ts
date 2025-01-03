import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Content {
  @Field()
  name: string;

  @Field()
  path: string;

  @Field()
  content?: string;
}
@ObjectType()
export class DetailCommitFile {
  @Field()
  sha: string;
  @Field()
  filename: string;
  @Field()
  status: 'added' | 'modified';
  @Field()
  additions: number;
  @Field()
  deletions: number;
  @Field()
  changes: number;
  @Field()
  blob_url: string;
  @Field()
  raw_url: string;
  @Field()
  contents_url: string;
  @Field()
  patch: string;
  @Field()
  content?: string;
}
@ObjectType()
export class DetailCommit {
  @Field()
  sha: string;
  @Field(() => [DetailCommitFile])
  files: DetailCommitFile[];
}

@ObjectType()
export class UserInfo {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  date: string;
}
@ObjectType()
export class CommitInfo {
  @Field(() => UserInfo)
  author: UserInfo;
  @Field(() => UserInfo)
  committer: UserInfo;
}
@ObjectType()
export class Commit {
  @Field()
  sha: string;

  @Field(() => CommitInfo)
  commit: CommitInfo;

  @Field(() => DetailCommit)
  detail: DetailCommit;
}
