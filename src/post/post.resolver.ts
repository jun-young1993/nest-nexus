import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post, Posts } from './models/post.models';
import { CreatePostInputModel } from './models/create-post.model';
import { Post as PostEntity } from './entities/post.entity';
import { PostType } from './enums/post-type.enum';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  async createPost(
    @Args('input') input: CreatePostInputModel,
  ): Promise<PostEntity> {
    const { tagIds, title, content } = input;

    return this.postService.create(tagIds, title, content);
  }

  @Query(() => Posts)
  async getPosts(
    @Args('limit', { nullable: true, type: () => Number }) limit,
    @Args('page', { nullable: true, type: () => Number }) page,
    @Args('tagId', { nullable: true, type: () => String }) tagId,
    @Args('type', { nullable: true, type: () => PostType }) type,
  ) {
    return await this.postService.findAll({
      limit: limit,
      page: page,
      tagId: tagId,
      type: type,
    });
  }

  @Query(() => Post)
  async getPost(@Args('id', { type: () => String }) id) {
    return this.postService.findOne(id);
  }
}
