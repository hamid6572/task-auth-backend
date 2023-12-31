import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { User } from '../../user/entities/user.entity.js';
import { Comment } from '../../comment/entities/comment.entity.js';
import { BaseEntity } from '../../common/base.entity.js';

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

registerEnumType(PostStatus, {
  name: 'PostStatus',
});

@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
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

  @ManyToOne(() => User, user => user.posts)
  @Field(() => User, { nullable: true })
  user: Relation<User>;

  @OneToMany(() => Comment, comment => comment.post)
  @Field(() => [Comment], { nullable: true })
  comments: Relation<Comment>[];
}

export class PostBuilder {
  private post: Post;

  constructor() {
    this.post = new Post();
  }

  setTitle(title: string): PostBuilder {
    this.post.title = title;
    return this;
  }

  setContent(content: string): PostBuilder {
    this.post.content = content;
    return this;
  }

  setStatus(status: PostStatus): PostBuilder {
    this.post.status = status;
    return this;
  }

  update(post: Post): PostBuilder {
    this.post = post;
    return this;
  }

  setUser(user: User): PostBuilder {
    this.post.user = user;
    return this;
  }

  build(): Post {
    return this.post;
  }
}
