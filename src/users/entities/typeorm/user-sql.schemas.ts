import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { JoinColumn } from 'typeorm';

@Entity()
export class EmailConfirmTypeOrmEntity {
  @PrimaryColumn()
  @OneToOne(() => UserTypeOrmEntity, { nullable: false })
  userId: string;

  @Column({ default: null, type: 'character varying' })
  confirmationCode: string | null;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expirationDate: Date | null;
  @Column()
  isConfirmed: boolean;
}

@Entity()
export class BanInfoTypeOrmEntity {
  @PrimaryColumn()
  @OneToOne(() => UserTypeOrmEntity, { nullable: false })
  userId: string;

  @Column()
  isBanned: boolean;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  banDate: Date | null;

  @Column({ nullable: true, type: 'character varying' })
  banReason: string | null;
}

@Entity()
export class UserTypeOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  login: string;

  @Column()
  passwordHash: string;

  @Column()
  email: string;

  @Column()
  addedAt: Date;

  @OneToOne(() => BanInfoTypeOrmEntity, (banInfo) => banInfo.userId, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  banInfo: BanInfoTypeOrmEntity;

  @OneToOne(
    () => EmailConfirmTypeOrmEntity,
    (emailConfirmation) => emailConfirmation.userId,
    { cascade: true, nullable: false },
  )
  @JoinColumn()
  emailConfirmation: EmailConfirmTypeOrmEntity;
}
