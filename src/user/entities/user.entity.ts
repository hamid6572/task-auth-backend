import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { hashSync } from 'bcryptjs';

import { Post } from '../../post/entities/post.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { BaseEntity } from '../../common/base.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
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

  @OneToMany(() => Post, post => post.user)
  @Field(() => [Post])
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.user)
  @Field(() => [Comment])
  comments: Comment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await hashSync(this.password);
  }
}

export class UserBuilder {
  private user: User;

  constructor() {
    this.user = new User();
  }

  setFirstName(firstName: string): UserBuilder {
    this.user.firstName = firstName;
    return this;
  }

  setLastName(lastName: string): UserBuilder {
    this.user.lastName = lastName;
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  setPassword(password: string): UserBuilder {
    this.user.password = password;
    return this;
  }

  setPosts(posts: Post[]): UserBuilder {
    this.user.posts = posts;
    return this;
  }

  setComments(comments: Comment[]): UserBuilder {
    this.user.comments = comments;
    return this;
  }

  updateUser(user: User): UserBuilder {
    this.user = user;
    return this;
  }

  build(): User {
    return this.user;
  }
}
