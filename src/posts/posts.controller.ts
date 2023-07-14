import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepo } from './posts.query.repo';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../pagination/pagination.models';
import { PostInputModel, PostViewDTO } from './post.models';

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
    const result: PostViewDTO | null | void =
      await this.postsQueryRepo.getPostById(postId);

    if (result === null) {
      throw new NotFoundException();
    }
    if (!result) {
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
    return result;
  }
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {
    const result = await this.postsService.createPost(inputModel);

    if (result === null) {
      throw new NotFoundException();
    }
    if (!result) {
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }

    return result;
  }
  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const result: boolean | null | void = await this.postsService.updatePost(
      postId,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException();
    }
    if (!result) {
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
