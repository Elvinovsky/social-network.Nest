import { UserInfo } from '../../../users/dto/view/user-view.models';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTypeOrmEntity } from '../../../users/entities/typeorm/user-sql.schemas';

@Entity()
export class Blog {
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

  @ManyToOne(() => UserTypeOrmEntity, (u) => u.id, {
    cascade: true,
    nullable: true,
  })
  blogOwnerInfo: UserInfo | null;

  @Column()
  userId: string;
}
