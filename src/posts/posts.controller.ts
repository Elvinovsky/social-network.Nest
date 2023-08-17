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
import { JwtBearerGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { LikesService } from '../likes/likes.service';
import { CurrentUserIdHeaders } from '../auth/decorators/current-userId-headers';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { ObjectIdPipe } from '../common/pipes/trim.pipe';
import { CommentInputModel } from '../comments/comment.models';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';
import { CommentsQueryRepo } from '../comments/comments.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get('/')
  @UseGuards(OptionalBearerGuard)
  async getPosts(
    @Query() query: QueryInputModel & SearchTitleTerm,
    @CurrentUserIdOptional() userId?: string,
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
  @UseGuards(OptionalBearerGuard)
  async getPost(
    @Param('postId') postId: string,
    @CurrentUserIdOptional() userId?: string,
  ) {
    const result: PostViewDTO | null = await this.postsQueryRepo.getPostById(
      postId,
      userId,
    );

    if (result === null) {
      throw new NotFoundException();
    }

    return result;
  }
  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body()
    inputModel: PostInputModel,
  ) {
    const result = await this.postsService.createPost(inputModel);

    if (result === null) {
      throw new BadRequestException([
        { field: 'blogId', message: 'blogId invalid' },
      ]);
    }

    return result;
  }
  @Put(':postId')
  @UseGuards(BasicAuthGuard)
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

  @Put(':postId/like-status')
  @UseGuards(JwtBearerGuard)
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

  @Get(':postId/comments')
  @UseGuards(OptionalBearerGuard)
  async getCommentsByPostId(
    @Query() query: QueryInputModel & SearchTitleTerm,
    @Param('postId', ObjectIdPipe) postId: string,
    @CurrentUserIdOptional() userId?: string,
  ) {
    const getCommentsByPostId =
      await this.commentsQueryRepo.getCommentsByPostId(
        postId,
        Number(query.pageNumber),
        Number(query.pageSize),
        query.sortBy,
        query.sortDirection,
        userId,
      );

    if (!getCommentsByPostId) {
      throw new NotFoundException();
    }
    return getCommentsByPostId;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  @UseGuards(JwtBearerGuard)
  async createCommentByPost(
    @Param('postId', ObjectIdPipe) postId: string,
    @Body() inputModel: CommentInputModel,
    @CurrentUserIdHeaders() userId: string,
  ) {
    const validatorPostId = await this.postsService.findPostById(postId);

    const user = await this.usersService.getUser(userId);
    if (!validatorPostId || !user) {
      throw new NotFoundException();
    }
    const comment = await this.commentsService.createComment(
      postId,
      userId,
      user.login,
      inputModel.content,
    );
    return comment;
  }
}
