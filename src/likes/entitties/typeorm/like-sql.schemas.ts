import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTypeOrmEntity } from '../../../users/entities/typeorm/user-sql.schemas';

@Entity()
export class LikeTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying' })
  status: string;

  @OneToOne(() => UserTypeOrmEntity, (u) => u.id)
  @JoinColumn()
  user: UserTypeOrmEntity;

  @Column({ type: 'uuid' })
  postIdOrCommentId: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @Column({ type: 'boolean' })
  isBanned: boolean;
}
