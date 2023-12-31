import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BlogTypeOrmEntity } from '../../../blogs/entities/typeorm/blog-sql.schemas';

@Entity()
export class PostTypeOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ nullable: false, type: 'character varying' })
  title: string;

  @Column({ nullable: false, type: 'character varying' })
  shortDescription: string;

  @Column({ nullable: false, type: 'character varying' })
  content: string;

  @Column({ nullable: false, type: 'timestamp without time zone' })
  addedAt: Date;

  @ManyToOne(() => BlogTypeOrmEntity, (b) => b.id)
  @JoinColumn()
  blog: BlogTypeOrmEntity;
}
