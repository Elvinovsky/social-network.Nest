import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './entities/device.schemas';
import { forwardRef, Module } from '@nestjs/common';
import { DevicesController } from './api/devices.controller';
import { DevicesService } from './application/devices.service';
import { DevicesRepository } from './infrastructure/mongo/devices.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { getConfiguration } from '../infrastructure/configuration/getConfiguration';
import { DevicesRawSqlRepository } from './infrastructure/sql/devices-raw-sql.repository';

@Module({
  imports: [
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
          : DevicesRawSqlRepository,
    },
  ],
  exports: [DevicesService],
})
export class DevicesModule {}
