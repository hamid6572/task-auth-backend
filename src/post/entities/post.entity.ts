import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { BaseEntity } from '../../common/base.entity';

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

registerEnumType(PostStatus, {
  name: 'PostStatus',
});

@Entity()
@ObjectType()
export class Post extends BaseEntity  {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  title: string;

  @Column({ type: 'text' })
  @Field()
  content: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  @Field(() => PostStatus)
  status: PostStatus;

  @ManyToOne(() => User, (user) => user.posts)
  @Field(() => User,{ nullable: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  @Field(() => [Comment],{ nullable: true })
  comments: Comment[];
}
