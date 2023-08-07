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
  Request,
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

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly likesService: LikesService,
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
    const result: PostViewDTO | null = await this.postsQueryRepo.getPostById(
      postId,
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
  async updateLikeStatusPost(
    @Request() req: { userId: string },
    @Param('postId') postId: string,
    @Body() inputModel: LikeStatus,
  ) {
    const post = await this.postsService.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const result = await this.likesService.createOrUpdateLike(
      postId,
      req.userId,
      inputModel.likeStatus,
    );
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('postId') postId: string) {
    const result: Document | null = await this.postsService.deletePost(postId);

    if (result === null) {
      throw new NotFoundException('post not found');
    }
  }
}
