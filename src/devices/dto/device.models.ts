import { UserInfo } from '../../users/dto/view/user-view.models';

export class SessionInputModel {
  ip: string;
  /**
   * IP address of device during signing in
   */
  title: string;
  /**
   * deviceName: for example Chrome 105 (received by parsing http header "user-agent")
   */
  lastActiveDate: string;
  /**
   *  Date of the last generating of refresh/access tokens
   */
  deviceId: string;
  /**
   * id of connected device session
   */
}
export class SessionCreateDTO {
  userInfo: UserInfo;
  deviceId: string;
  issuedAt: number;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
}
export class DeviceWithoutUser {
  deviceId: string;
  issuedAt: number;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
}
export type DeviceViewDTO = {
  ip: string;
  /**
   * IP address of device during signing in
   */
  title: string;
  /**
   * deviceName: for example Chrome 105 (received by parsing http header "user-agent")
   */
  lastActiveDate: string;
  /**
   *  Date of the last generating of refresh/access tokens
   */
  deviceId: string;
  /**
   * id of connected device session
   */
};
