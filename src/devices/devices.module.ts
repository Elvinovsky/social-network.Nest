import { MongooseModule } from '@nestjs/mongoose';
import {
  Device,
  DeviceSchema,
} from './entities/mongoose/device-no-sql.schemas';
import { forwardRef, Module } from '@nestjs/common';
import { DevicesController } from './api/devices.controller';
import { DevicesService } from './application/devices.service';
import { DevicesRepository } from './infrastructure/repositories/mongo/devices.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { getConfiguration } from '../infrastructure/configuration/getConfiguration';
import { DevicesRawSqlRepository } from './infrastructure/repositories/sql/devices-raw-sql.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceTypeOrmEntity } from './entities/typeorm/device-sql.schemas';
import { DevicesTypeormRepository } from './infrastructure/repositories/typeorm/devices-typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceTypeOrmEntity]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    {
      provide: DevicesRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? DevicesRepository
          : getConfiguration().repo_type === 'sql'
          ? DevicesRawSqlRepository
          : DevicesTypeormRepository,
    },
  ],
  exports: [DevicesService],
})
export class DevicesModule {}
