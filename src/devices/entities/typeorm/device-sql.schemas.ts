import { UserInfo } from '../../../users/dto/view/user-view.models';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  deviceId: string;

  @Column('simple-json')
  userInfo: UserInfo;

  @Column()
  issuedAt: number;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column()
  lastActiveDate: Date;

  @Column()
  expirationDate: Date;
}
