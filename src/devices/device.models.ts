import { UserInfo } from '../users/user.models';

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
export type SessionCreateDTO = {
  userInfo: UserInfo;
  deviceId: string;
  issuedAt: number;
  ip: string | null;
  title: string | null;
  lastActiveDate: string;
  expirationDate: Date;
};

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
