import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { PostsQueryRepository } from './infrastructure/mongo/posts-query-repository.service';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../pagination/pagination.models';
import { PostInputModel, PostViewDTO } from './post.models';
import { LikeStatus } from '../likes/like.models';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { LikesService } from '../likes/likes.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { CommentInputModel } from '../comments/comment.models';
import { CommentsService } from '../comments/comments.service';
import { CommentsQueryRepo } from '../comments/infrastructure/repositories/mongo/comments.query.repository';
import { UserInfo } from '../users/user.models';
import { CurrentSessionInfoFromAccessJWT } from '../auth/decorators/current-session-info-jwt';
import { ParamUUIdPipe } from '../common/pipes/object-id.pipe';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
  @UseGuards(OptionalBearerGuard)
  async getPosts(
    @Query() query: QueryInputModel,
    @Query() queryTitle: SearchTitleTerm,
    @CurrentUserIdOptional() userId?: string,
  ) {
    return await this.postsQueryRepo.getSortedPosts(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      userId,
      queryTitle.searchTitleTerm,
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

  @Put(':postId/like-status')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatusPost(
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
    @Param('postId', ParamUUIdPipe) postId: string,
    @Body() inputModel: LikeStatus,
  ) {
    const post = await this.postsService.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const result = await this.likesService.createOrUpdateLike(
      postId,
      sessionInfo.userInfo,
      inputModel.likeStatus,
    );
    return result;
  }

  @Get(':postId/comments')
  @UseGuards(OptionalBearerGuard)
  async getCommentsByPostId(
    @Query() query: QueryInputModel,
    @Param('postId') postId: string,
    @CurrentUserIdOptional() userId?: string,
  ) {
    const getCommentsByPostId =
      await this.commentsQueryRepo.getCommentsByPostId(
        postId,
        query.pageNumber,
        query.pageSize,
        query.sortBy,
        query.sortDirection,
        userId,
      );

    if (!getCommentsByPostId) {
      throw new NotFoundException();
    }
    return getCommentsByPostId;
  }

  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtBearerGuard)
  async createCommentByPost(
    @Param('postId') postId: string,
    @Body() inputModel: CommentInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const validatorPostId = await this.postsService.findPostById(postId);
    if (!validatorPostId) {
      throw new NotFoundException();
    }

    const comment = await this.commentsService.createComment(
      postId,
      sessionInfo.userInfo,
      inputModel.content,
    );
    return comment;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body()
    inputModel: PostInputModel,
  ) {
    const result = await this.postsService.createPost(inputModel);

    return result;
  }

  @Delete(':postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('postId') postId: string) {
    const result: Document | null | boolean =
      await this.postsService.deletePost(postId);

    if (result === null) {
      throw new NotFoundException('Not Found');
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }
}
