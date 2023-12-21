import { Module } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { SearchResolver } from './search.resolver.js';

@Module({
  imports: [],
  providers: [SearchService, SearchResolver],
  exports: [SearchService],
})
export class SearchModule {}
