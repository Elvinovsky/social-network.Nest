import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @Column()
  postIdOrCommentId: string;

  @Column()
  addedAt: Date;

  @Column()
  isBanned: boolean;
}
