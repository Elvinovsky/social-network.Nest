import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTypeOrmEntity } from '../../../users/entities/typeorm/user-sql.schemas';

@Entity()
export class BlogTypeOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ nullable: false, type: 'character varying' })
  name: string;

  @Column({ nullable: false, type: 'character varying' })
  description: string;

  @Column({ nullable: false, type: 'character varying' })
  websiteUrl: string;

  @Column({ nullable: false, type: 'timestamp without time zone' })
  addedAt: Date;

  @Column({ nullable: false, type: 'boolean' })
  isMembership: boolean;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.id, {
    nullable: true,
  })
  @JoinColumn()
  user: UserTypeOrmEntity | null;
}
