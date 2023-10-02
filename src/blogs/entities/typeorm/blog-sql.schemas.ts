import { UserInfo } from '../../../users/dto/view/user-view.models';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  addedAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  @Column('simple-json')
  blogOwnerInfo: UserInfo | null;
}
