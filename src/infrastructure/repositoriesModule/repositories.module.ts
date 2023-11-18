import { ClearMongoRepository } from '../../ClearDataTest/clear-mongo.repository';
import { BlogsRepository } from '../../blogs/infrastructure/repositories/mongo/blogs.repository';
import { BlogsQueryRepo } from '../../blogs/infrastructure/repositories/mongo/blogs.query.repo';
import { PostsRepository } from '../../posts/infrastructure/repositories/mongo/posts.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/repositories/mongo/posts-query-repository.service';
import { CommentsRepository } from '../../comments/infrastructure/repositories/mongo/comments.repository';
import { LikesRepository } from '../../likes/infrastructure/repositories/mongo/likes.repository';
import { UsersMongooseRepository } from '../../users/infrastructure/repositories/mongo/users-mongoose.repository';
import { UsersMongooseQueryRepository } from '../../users/infrastructure/repositories/mongo/users-mongoose.query.repo';
import { BlogsRawSqlRepository } from '../../blogs/infrastructure/repositories/sql/blogs-raw-sql.repository';
import { BlogsQueryRawSqlRepository } from '../../blogs/infrastructure/repositories/sql/blogs-query-raw-sql.repository';
import { PostsRawSqlRepository } from '../../posts/infrastructure/repositories/sql/posts-raw-sql.repository';
import { PostsRawSqlQueryRepository } from '../../posts/infrastructure/repositories/sql/posts-raw-sql-query.repository';
import { CommentsRawSqlRepository } from '../../comments/infrastructure/repositories/sql/comments-raw-sql.repository';
import { LikesRawSqlRepository } from '../../likes/infrastructure/repositories/sql/likes-raw-sql.repository';
import { UsersRawSQLRepository } from '../../users/infrastructure/repositories/sql/users-raw-sql.repository';
import { UsersRawSQLQueryRepository } from '../../users/infrastructure/repositories/sql/users-raw-sql-query.repository';
import { UsersTypeormRepository } from '../../users/infrastructure/repositories/typeorm/users-typeorm.repository';
import { UsersTypeormQueryRepo } from '../../users/infrastructure/repositories/typeorm/users-typeorm-query.repo';
import { ClearSQLRepository } from '../../ClearDataTest/clear-sql.repository';
import { ClearTypeOrmRepository } from '../../ClearDataTest/clear-typeorm.repository';
import { DevicesRepository } from '../../devices/infrastructure/repositories/mongo/devices.repository';
import { DevicesRawSqlRepository } from '../../devices/infrastructure/repositories/sql/devices-raw-sql.repository';
import { DevicesTypeormRepository } from '../../devices/infrastructure/repositories/typeorm/devices-typeorm.repository';
import { CommentsQueryRepo } from '../../comments/infrastructure/repositories/mongo/comments.query.repository';
import { UserCreateDTO } from '../../users/dto/create/users-create.models';
import {
  MeViewModel,
  SAUserViewDTO,
  UserInfo,
  UserViewDTO,
} from '../../users/dto/view/user-view.models';
import { BanUserInputModel } from '../../users/dto/input/user-input.models';
import { PaginatorType } from '../pagination/pagination.models';
import {
  DeviceViewDTO,
  SessionCreateDTO,
} from '../../devices/dto/device.models';
import {
  BlogCreateDTO,
  BlogInputModel,
  BlogViewDTO,
  SABlogViewDTO,
} from '../../blogs/dto/blog.models';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostViewDTO,
} from '../../posts/dto/post.models';
import { LikeCreateDTO } from '../../likes/dto/like.models';
import {
  CommentCreateDTO,
  CommentViewDTO,
} from '../../comments/dto/comment.models';
import { CommentsQueryRawSqlRepository } from '../../comments/infrastructure/repositories/sql/comments-query-raw-sql.repository';
import { BlogsTypeOrmRepository } from '../../blogs/infrastructure/repositories/typeorm/blogs-typeorm.repository';
import { BlogsQueryTypeormRepository } from '../../blogs/infrastructure/repositories/typeorm/blogs-query-typeorm.repository';

export abstract class IUserRepository {
  abstract findUser(userId: string): Promise<SAUserViewDTO | null>;

  abstract getUser(userId: string): Promise<UserViewDTO | null>;

  abstract createUser(inputModel: UserCreateDTO): Promise<UserViewDTO>;

  abstract deleteUserById(userId: string): Promise<number | null>;

  abstract findUserByEmail(email: string): Promise<UserCreateDTO | null>;

  abstract findUserByLogin(login: string): Promise<UserCreateDTO | null>;

  abstract findUserByCode(code: string): Promise<UserCreateDTO | null>;

  abstract findUserLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserCreateDTO | null>;

  abstract confirmEmail(code: string): Promise<boolean>;

  abstract updateConfirmationCodeByEmail(
    email: string,
    newCode: string,
  ): Promise<boolean>;

  abstract updatePasswordForUser(hash: string, code: string): Promise<boolean>;

  abstract banUser(
    userId: string,
    inputModel: BanUserInputModel,
  ): Promise<boolean | null>;

  abstract unBanUser(
    userId: string,
    inputModel: BanUserInputModel,
  ): Promise<boolean | null>;

  abstract updateEmail(userId: string, email: string): Promise<boolean>;

  abstract updateLogin(userId: string, login: string): Promise<boolean>;
}

export abstract class IUserQueryRepository {
  abstract getSortedUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>>;

  abstract getSortedUsersForSA(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    banStatus: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>>;

  abstract getUserInfo(id: string): Promise<MeViewModel | null>;
}

export abstract class IDeviceRepository {
  abstract findDeviceSessionByIAT(iat: number): Promise<boolean>;

  abstract findDeviceIdAmongSessions(id: string): Promise<boolean>;

  abstract getDevicesSessionsByUserId(
    userId: string,
  ): Promise<DeviceViewDTO[] | null>;

  abstract addDeviceSession(deviceSession: SessionCreateDTO): Promise<void>;

  abstract updateDeviceSession(
    newIssuedAt: number,
    issuedAt: number,
  ): Promise<boolean>;

  abstract deleteDeviceSessionByIAT(issuedAt: number): Promise<boolean>;

  abstract deleteDeviceSessionSpecified(
    deviceId: string,
    userId: string,
  ): Promise<boolean>;

  abstract deleteDevicesSessionsExceptCurrent(
    issuedAt: number,
    userId: string,
  ): Promise<boolean>;

  abstract deleteAllDevicesAdminOrder(userId: string): Promise<number>;
}

export abstract class IClearRepository {
  abstract deleteDB(): Promise<void>;
}
export abstract class IBlogRepository {
  abstract findBlogById(blogId: string): Promise<BlogCreateDTO | null>;

  abstract addNewBlog(inputModel: BlogCreateDTO): Promise<BlogViewDTO>;

  abstract updateBlogById(
    blogId: string,
    inputModel: BlogInputModel,
  ): Promise<number>;

  abstract deleteBlogById(blogId: string): Promise<boolean>;

  abstract updateBlogOwnerInfo(
    userInfo: UserInfo,
    blogId: string,
  ): Promise<boolean>;
}

export abstract class IBlogQueryRepository {
  abstract getBlogById(blogId: string): Promise<BlogViewDTO | null>;

  abstract getSortedBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>>;

  abstract getSortedBlogsForCurrentBlogger(
    userInfo: UserInfo,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>>;

  abstract getSortedPostsBlog(
    blogId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]> | null>;

  abstract getSortedBlogsForSA(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<SABlogViewDTO[]>>;
}

export abstract class ILikesRepository {
  abstract countLikes(id: string): Promise<number>;

  abstract countDisLikes(id: string): Promise<number>;

  abstract getLikes(id: string): Promise<LikeCreateDTO[]>;

  abstract getLikeInfo(
    userId: string,
    postOrCommentId: string,
  ): Promise<LikeCreateDTO | null>;

  abstract updateLikeInfo(
    userId: string,
    postOrCommentId: string,
    statusType: string,
  ): Promise<boolean>;

  abstract addLikeInfo(inputModel: LikeCreateDTO): Promise<boolean>;

  abstract banLikes(userId: string): Promise<boolean>;

  abstract unBanLikes(userId: string): Promise<boolean>;
}
export abstract class IPostRepository {
  abstract findPostById(id: string): Promise<boolean>;

  abstract createPost(inputModel: PostCreateDTO): Promise<PostViewDTO>;

  abstract updatePostById(
    postId: string,
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean>;

  abstract deletePost(postId: string): Promise<boolean>;
}

export abstract class IPostQueryRepository {
  abstract getSortedPosts(
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
    userId?: string,
    searchTitleTerm?: string,
  ): Promise<PaginatorType<PostViewDTO[]>>;

  abstract getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewDTO | null>;
}

export abstract class ICommentQueryRepository {
  abstract getCommentsByPostId(
    postId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<CommentViewDTO[]> | null>;
}

export abstract class ICommentRepository {
  abstract getCommentById(
    commentId: string,
    userId: any,
  ): Promise<CommentViewDTO | null>;

  abstract addNewComment(newComment: CommentCreateDTO): Promise<CommentViewDTO>;

  abstract updateCommentById(id: string, content: string): Promise<boolean>;

  abstract findCommentById(id: string): Promise<CommentCreateDTO | null>;

  abstract deleteComment(id: string): Promise<boolean>;

  abstract banCommentsUserId(userId: string): Promise<boolean>;

  abstract unBanCommentsUserId(userId: string): Promise<boolean>;
}

export const repoTypeToClassMap = {
  mongo: [
    { provide: IClearRepository, useClass: ClearMongoRepository },
    { provide: IBlogRepository, useClass: BlogsRepository },
    { provide: IBlogQueryRepository, useClass: BlogsQueryRepo },
    { provide: IPostRepository, useClass: PostsRepository },
    { provide: IPostQueryRepository, useClass: PostsQueryRepository },
    { provide: ICommentRepository, useClass: CommentsRepository },
    { provide: ICommentQueryRepository, useClass: CommentsQueryRepo },
    { provide: ILikesRepository, useClass: LikesRepository },
    { provide: IUserRepository, useClass: UsersMongooseRepository },
    {
      provide: IUserQueryRepository,
      useClass: UsersMongooseQueryRepository,
    },
    { provide: IDeviceRepository, useClass: DevicesRepository },
  ],
  sql: [
    { provide: IClearRepository, useClass: ClearSQLRepository },
    { provide: IBlogRepository, useClass: BlogsRawSqlRepository },
    {
      provide: IBlogQueryRepository,
      useClass: BlogsQueryRawSqlRepository,
    },
    { provide: IPostRepository, useClass: PostsRawSqlRepository },
    {
      provide: IPostQueryRepository,
      useClass: PostsRawSqlQueryRepository,
    },
    { provide: ICommentRepository, useClass: CommentsRawSqlRepository },
    {
      provide: ICommentQueryRepository,
      useClass: CommentsQueryRawSqlRepository,
    },
    { provide: ILikesRepository, useClass: LikesRawSqlRepository },
    { provide: IUserRepository, useClass: UsersRawSQLRepository },
    {
      provide: IUserQueryRepository,
      useClass: UsersRawSQLQueryRepository,
    },
    { provide: IDeviceRepository, useClass: DevicesRawSqlRepository },
  ],
  typeorm: [
    { provide: IClearRepository, useClass: ClearTypeOrmRepository },
    { provide: IBlogRepository, useClass: BlogsTypeOrmRepository },
    {
      provide: IBlogQueryRepository,
      useClass: BlogsQueryTypeormRepository,
    },
    { provide: IPostRepository, useClass: PostsRawSqlRepository },
    {
      provide: IPostQueryRepository,
      useClass: PostsRawSqlQueryRepository,
    },
    { provide: ICommentRepository, useClass: CommentsRawSqlRepository },
    {
      provide: ICommentQueryRepository,
      useClass: CommentsQueryRawSqlRepository,
    },
    { provide: ILikesRepository, useClass: LikesRawSqlRepository },
    { provide: IUserRepository, useClass: UsersTypeormRepository },
    { provide: IUserQueryRepository, useClass: UsersTypeormQueryRepo },
    { provide: IDeviceRepository, useClass: DevicesTypeormRepository },
  ],
};

export const repoTypeToClassMapUser = {
  mongo: [
    { provide: ICommentRepository, useClass: CommentsRepository },
    { provide: ILikesRepository, useClass: LikesRepository },
    { provide: IUserRepository, useClass: UsersMongooseRepository },
    {
      provide: IUserQueryRepository,
      useClass: UsersMongooseQueryRepository,
    },
  ],
  sql: [
    { provide: ICommentRepository, useClass: CommentsRawSqlRepository },
    { provide: ILikesRepository, useClass: LikesRawSqlRepository },
    { provide: IUserRepository, useClass: UsersRawSQLRepository },
    {
      provide: IUserQueryRepository,
      useClass: UsersRawSQLQueryRepository,
    },
  ],
  typeorm: [
    { provide: ICommentRepository, useClass: CommentsRawSqlRepository },
    { provide: ILikesRepository, useClass: LikesRawSqlRepository },
    { provide: IUserRepository, useClass: UsersTypeormRepository },
    { provide: IUserQueryRepository, useClass: UsersTypeormQueryRepo },
  ],
};
