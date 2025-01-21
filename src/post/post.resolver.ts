import { Args, Query, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post, Posts } from './post.models';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => Posts)
  async getPosts(
    @Args('limit', { nullable: true, type: () => Number }) limit,
    @Args('page', { nullable: true, type: () => Number }) page,
  ) {
    return await this.postService.findAll({
      limit: limit,
      page: page,
    });
  }

  @Query(() => Post)
  async getPost(@Args('id', { type: () => String }) id) {
    return this.postService.findOne(id);
  }
}
