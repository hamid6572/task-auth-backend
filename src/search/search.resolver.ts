import { Resolver, Args, Query } from '@nestjs/graphql';
import { SearchService } from './search.service.js';

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  // @UseGuards(JwtAuthGuard)
  // @Query(() => [SearchDto], { name: 'search' })
  // async globalSearch(@Args('input') input: string): Promise<SearchDto[]> {
  //   return this.searchService.search(input)
  // }
}
