import { Module } from '@nestjs/common';
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

export const repoTypeToClassMap = {
  mongo: [
    ClearMongoRepository,
    BlogsRepository,
    BlogsQueryRepo,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    LikesRepository,
    UsersMongooseRepository,
    UsersMongooseQueryRepository,
    DevicesRepository,
  ],
  sql: {
    ClearSQLRepository,
    BlogsRawSqlRepository,
    BlogsQueryRawSqlRepository,
    PostsRawSqlRepository,
    PostsRawSqlQueryRepository,
    CommentsRawSqlRepository,
    LikesRawSqlRepository,
    UsersRawSQLRepository,
    UsersRawSQLQueryRepository,
    DevicesRawSqlRepository,
  },
  typeorm: {
    ClearTypeOrmRepository,
    BlogsRawSqlRepository,
    BlogsQueryRawSqlRepository,
    PostsRawSqlRepository,
    PostsRawSqlQueryRepository,
    CommentsRawSqlRepository,
    LikesRawSqlRepository,
    UsersTypeormRepository,
    UsersTypeormQueryRepo,
    DevicesTypeormRepository,
  },
};

export const repoTypeToClassMapUser = {
  mongo: [
    CommentsRepository,
    LikesRepository,
    UsersMongooseRepository,
    UsersMongooseQueryRepository,
  ],
  sql: {
    CommentsRawSqlRepository,
    LikesRawSqlRepository,
    UsersRawSQLRepository,
    UsersRawSQLQueryRepository,
  },
  typeorm: {
    CommentsRawSqlRepository,
    LikesRawSqlRepository,
    UsersTypeormRepository,
    UsersTypeormQueryRepo,
  },
};

@Module({
  providers: [],
})
export class RepositoriesModule {}
