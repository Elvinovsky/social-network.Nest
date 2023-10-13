import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogTypeOrmEntity } from '../../../blogs/entities/typeorm/blog-sql.schemas';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @OneToOne(() => BlogTypeOrmEntity, (b) => b.id)
  blogId: string;

  @OneToOne(() => BlogTypeOrmEntity, (b) => b.name)
  blogName: string;

  @Column()
  addedAt: Date;
}
