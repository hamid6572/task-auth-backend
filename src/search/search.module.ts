import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchResolver } from './search.resolver';

@Module({
    imports: [],
    providers: [SearchService, SearchResolver],
    exports: [SearchService]
  })
  export class SearchModule {}
