import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Post } from '../../post/entities/post.entity.js';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from '../../common/base.entity.js';

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'text' })
  @Field({ nullable: true })
  text: string;

  @ManyToOne(() => Post, post => post.comments)
  @Field(() => Post)
  post: Relation<Post>;

  @ManyToOne(() => User, user => user.comments)
  @Field(() => User)
  user: Relation<User>;

  @ManyToOne(() => Comment, parent => parent.replies, { onDelete: 'CASCADE' })
  @Field(() => Comment, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, reply => reply.parent)
  @Field(() => [Comment], { nullable: true })
  replies: Comment[];
}
