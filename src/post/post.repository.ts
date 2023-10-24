import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
}