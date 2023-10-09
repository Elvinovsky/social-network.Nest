import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeOrmEntity } from '../users/entities/typeorm/user-sql.schemas';
import { DeviceTypeOrmEntity } from '../devices/entities/typeorm/device-sql.schemas';

@Injectable()
export class ClearTypeOrmRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    protected usersRepo: Repository<UserTypeOrmEntity>,

    @InjectRepository(DeviceTypeOrmEntity)
    protected devicesRepo: Repository<DeviceTypeOrmEntity>,
  ) {}
  async deleteDB() {
    await this.devicesRepo.createQueryBuilder('d').delete().execute();
    await this.usersRepo.createQueryBuilder('u').delete().execute();
  }
}
