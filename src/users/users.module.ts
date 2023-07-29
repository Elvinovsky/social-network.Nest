import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query.repo';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AuthRepository } from '../auth/auth.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {}
