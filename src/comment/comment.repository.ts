import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from './entities/comment.entity.js';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }
}
