import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepo } from './posts.query.repo';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../pagination/pagination.models';
import { PostInputModel } from './post.models';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}
  @Get('/')
  async getPosts(@Query() query: QueryInputModel & SearchTitleTerm) {
    return await this.postsQueryRepo.getSortedPosts(
      query.searchTitleTerm,
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
      //user?.id
    );
  }
  @Get(':postId')
  async getPost(@Param('postId') postId: string) {
    const post = await this.postsQueryRepo.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {
    const newPost = await this.postsService.createPost(inputModel);
    if (!newPost) {
      throw new NotFoundException();
    }

    return newPost;
  }
}
