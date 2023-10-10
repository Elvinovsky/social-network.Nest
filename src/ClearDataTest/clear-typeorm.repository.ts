import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from '../users/entities/typeorm/user-sql.schemas';
import { DeviceTypeOrmEntity } from '../devices/entities/typeorm/device-sql.schemas';

@Injectable()
export class ClearTypeOrmRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    protected usersRepo: Repository<UserTypeOrmEntity>,

    @InjectRepository(DeviceTypeOrmEntity)
    protected devicesRepo: Repository<DeviceTypeOrmEntity>,

    @InjectRepository(BanInfoTypeOrmEntity)
    protected banRepo: Repository<BanInfoTypeOrmEntity>,

    @InjectRepository(EmailConfirmTypeOrmEntity)
    protected emailRepo: Repository<EmailConfirmTypeOrmEntity>,
  ) {}
  async deleteDB() {
    await this.devicesRepo.createQueryBuilder('d').delete().execute();
    await this.usersRepo.createQueryBuilder('u').delete().execute();
    await this.banRepo.createQueryBuilder('b').delete().execute();
    await this.emailRepo.createQueryBuilder('e').delete().execute();
  }
}
