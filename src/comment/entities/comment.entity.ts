import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from '../../common/base.entity';

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'text' })
  @Field()
  text: string;

  @ManyToOne(() => User, (user) => user.comments)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @Field(() => Post)
  post: Post;

  @ManyToOne(() => Comment, (parent) => parent.replies)
  @Field(() => Comment, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, (reply) => reply.parent)
  @Field(() => [Comment], { nullable: true })
  replies: Comment[];
}
