import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { UserTypeOrmEntity } from '../../../users/entities/typeorm/user-sql.schemas';

@Entity()
export class DeviceTypeOrmEntity {
  @PrimaryColumn({ nullable: false })
  deviceId: string;

  @OneToMany(() => UserTypeOrmEntity, (u) => u.id, {
    nullable: false,
  })
  @JoinColumn()
  user: UserTypeOrmEntity;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false, type: 'bigint' })
  issuedAt: number;

  @Column({ nullable: false })
  ip: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @Column({ nullable: false, type: 'timestamp with time zone' })
  expirationDate: Date;
}
