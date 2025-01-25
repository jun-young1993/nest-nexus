import { Args, Query, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import {Post, Posts, PostTags, TagWithPostCount} from './post.models';
import {PostTagService} from "./post-tag.service";

@Resolver()
export class PostTagResolver {
  constructor(
      private readonly postService: PostService,
      private readonly postTagService: PostTagService
  ) {}

  @Query(() => [TagWithPostCount])
  async getTagsWithPostCount(){
    return this.postTagService.getTagsWithPostCount()
  }

  @Query(() => PostTags)
  async getPostTags(){
    return this.postTagService.findAll()
  }
}
