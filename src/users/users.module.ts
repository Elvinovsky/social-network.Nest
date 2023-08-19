import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query.repo';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersService, UsersQueryRepository],
})
export class UsersModule {}
