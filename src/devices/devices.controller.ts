// import {
//   Controller,
//   Delete,
//   ForbiddenException,
//   Get,
//   NotFoundException,
//   UseGuards,
// } from '@nestjs/common';
// import { DevicesService } from './devices.service';
// import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard';
// @UseGuards(JwtRefreshGuard)
// @Controller('devices')
// export class DevicesController {
//   constructor(private devicesService: DevicesService) {}
//   @Get()
//   async getDevices() {
//     // const userId = req.userId.toString()
//     const devicesSessionsByUser =
//       await this.devicesService.findDevicesSessionsByUserId('userId');
//   }
//
//   @UseGuards(JwtRefreshGuard)
//   @Delete()
//   async deleteDevices() {
//     const userId = req.userId.toString();
//     await this.devicesService.logoutDevicesSessionsByUser(req.issuedAt, userId);
//     res.sendStatus(204);
//     return;
//   }
//   @Delete()
//   async deleteDeviceById(req: Request, res: Response) {
//     const deviceId = req.params.deviceId;
//     const userId = req.userId.toString();
//     const logoutDeviceSession: boolean | null =
//       await this.devicesService.logoutDeviceSessionByDeviceId(deviceId, userId);
//
//     if (logoutDeviceSession === null) {
//       throw new NotFoundException();
//     }
//
//     if (!logoutDeviceSession) {
//       throw new ForbiddenException();
//     }
//   }
// }
