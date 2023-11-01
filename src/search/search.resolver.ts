import { Resolver, Args, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import { SearchService } from "./search.service";
import { SearchDto } from "./dto/search-reponse";

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}
  
  // @UseGuards(JwtAuthGuard)
  // @Query(() => [SearchDto], { name: 'search' })
  // async globalSearch(@Args('input') input: string): Promise<SearchDto[]> {
  //   return this.searchService.search(input)
  // }
}