import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './device.schemas';
import { forwardRef, Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './infrastructure/mongo/devices.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { getConfiguration } from '../configuration/getConfiguration';
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
