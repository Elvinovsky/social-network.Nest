import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  confirmationCode: string | null;

  @Column()
  expirationDate: Date | null;

  @Column()
  isConfirmed: boolean;
}

@Entity()
class BanInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isBanned: boolean;

  @Column()
  banDate: string | null;

  @Column()
  banReason: string | null;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  login: string;

  @Column()
  passwordHash: string;

  @Column()
  email: string;

  @Column()
  addedAt: Date;

  @OneToOne(() => EmailConfirmation)
  @JoinColumn()
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => BanInfo)
  @JoinColumn()
  banInfo: BanInfo;
}
