import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class EmailConfirmTypeOrmEntity {
  @PrimaryColumn()
  @OneToOne(() => UserTypeOrmEntity, (u) => u.id)
  userId: string;

  @Column({ default: null })
  confirmationCode: string;

  @Column({ default: null })
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;
}

@Entity()
export class BanInfoTypeOrmEntity {
  @PrimaryColumn()
  @OneToOne(() => UserTypeOrmEntity, (u) => u.id)
  userId: string;

  @Column()
  isBanned: boolean;

  @Column({ default: null })
  banDate: Date;

  @Column({ default: null })
  banReason: string;
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
}
