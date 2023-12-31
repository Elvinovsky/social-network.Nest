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
import { PostsService } from '../application/posts.service';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../../infrastructure/pagination/pagination.models';
import { PostInputModel, PostViewDTO } from '../dto/post.models';
import { LikeStatus } from '../../likes/dto/like.models';
import { JwtBearerGuard } from '../../auth/infrastructure/guards/jwt-bearer-auth.guard';
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic-auth.guard';
import { OptionalBearerGuard } from '../../auth/infrastructure/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../../auth/infrastructure/decorators/current-userId-optional.decorator';
import { CommentInputModel } from '../../comments/dto/comment.models';
import { CommentsService } from '../../comments/application/comments.service';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { CurrentSessionInfoFromAccessJWT } from '../../auth/infrastructure/decorators/current-session-info-jwt';
import { ParamUUIdPipe } from '../../infrastructure/common/pipes/object-id.pipe';
import {
  ICommentQueryRepository,
  IPostQueryRepository,
} from '../../infrastructure/repositoriesModule/repositories.module';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUpdateLikeCommand } from '../../likes/application/use-cases/create-update-like-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: IPostQueryRepository,
    private commandBus: CommandBus,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: ICommentQueryRepository,
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

    const createUpdateLikeDTO = {
      postOrCommentId: postId,
      userInfo: sessionInfo.userInfo,
      statusType: inputModel.likeStatus,
    };

    const result = await this.commandBus.execute(
      new CreateUpdateLikeCommand(createUpdateLikeDTO),
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
