import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { SearchModule } from '../search/search.module';
import { CommonModule } from '../common/common.module';
import { PostRepository, PostResolver, PostService, PostSubscriber } from './';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
    SearchModule,
    CommonModule,
  ],
  providers: [PostService, PostResolver, PostRepository, PostSubscriber],
  exports: [PostService],
})
export class PostModule {}
