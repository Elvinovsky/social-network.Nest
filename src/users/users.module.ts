import { UsersService } from './aplication/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserRegistrationToAdminUseCase } from './aplication/use-cases/user-registration-to-admin-use-case.service';
import { CqrsModule } from '@nestjs/cqrs';

const useCases = [UserRegistrationToAdminUseCase];
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [UsersController],
  providers: [...useCases, UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersService, UsersQueryRepository],
})
export class UsersModule {}
