import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from '../../common/base.entity';
import { hashSync } from "bcryptjs";

@Entity()
@ObjectType()
export class User extends BaseEntity{
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  @Field(() => [Post])
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @Field(() => [Comment])
  comments: Comment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
      this.password = await hashSync(this.password)
  }
}
