import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepo } from './posts.query.repo';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../pagination/pagination.models';
import { PostInputModel, PostViewDTO } from './post.models';
import { LikeStatus } from '../likes/like.models';
import { JwtBearerGuard } from '../auth/guards/jwt-auth.guard';
import { LikesService } from '../likes/likes.service';
import { CurrentUserIdHeaders } from '../auth/decorators/current-userId-headers';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { JwtBearerStrategy } from '../auth/strategies/jwt-bearer.strategy';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly likesService: LikesService,
  ) {}

  @UseGuards(JwtBearerStrategy)
  @Get('/')
  async getPosts(
    @Query() query: QueryInputModel & SearchTitleTerm,
    @CurrentUserIdHeaders() userId: string,
  ) {
    return await this.postsQueryRepo.getSortedPosts(
      query.searchTitleTerm,
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
      userId,
    );
  }
  @Get(':postId')
  async getPost(@Param('postId') postId: string, @Req() req) {
    const result: PostViewDTO | null = await this.postsQueryRepo.getPostById(
      postId,
      req?.userId,
    );

    if (result === null) {
      throw new NotFoundException();
    }

    return result;
  }
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {
    const result = await this.postsService.createPost(inputModel);

    if (result === null) {
      throw new BadRequestException([
        { field: 'blogId', message: 'blogId invalid' },
      ]);
    }

    return result;
  }
  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const result: boolean | null = await this.postsService.updatePost(
      postId,
      inputModel,
    );

    if (result === null) {
      throw new BadRequestException([
        { field: 'blogId', message: 'blogId invalid' },
      ]);
    }
    if (!result) {
      throw new NotFoundException('post not found');
    }
  }

  @UseGuards(JwtBearerGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatusPost(
    @CurrentUserIdHeaders() userId: string,
    @Param('postId') postId: string,
    @Body() inputModel: LikeStatus,
  ) {
    const post = await this.postsService.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const result = await this.likesService.createOrUpdateLike(
      postId,
      userId,
      inputModel.likeStatus,
    );
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('postId') postId: string) {
    const result: Document | null = await this.postsService.deletePost(postId);

    if (result === null) {
      throw new NotFoundException('post not found');
    }
  }
}
