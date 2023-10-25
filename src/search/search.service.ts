
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PostSearchBody } from './dto/post-search-body';
import { Post } from '../post/entities/post.entity';
 
@Injectable()
export default class SearchService {
  index = 'posts'
 
  constructor(
    private readonly elasticsearchService: ElasticsearchService
  ) {}
 
  async indexPost(post: Post) {
    let postIndices = await this.elasticsearchService.index<PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        user: post.user
      }
    });
    console.log("postIndices", postIndices);
    //await this.deleteAllData()
    return postIndices;
  }
 
  async search(text: string){
    const body = await this.elasticsearchService.search({
      index: this.index,
      body: {
        "query": {
          "bool": {
            "should": [
              {
                "wildcard": {
                  "title": "*x*"
                }
              },
              {
                "wildcard": {
                  "content": "*x*"
                }
              },
              {
                "wildcard": {
                  "user.firstName": "*x*"
                }
              },
              {
                "wildcard": {
                  "user.lastName": "*x*"
                }
              },
              {
                "wildcard": {
                  "user.email": "*t*"
                }
              }
            ]
          }
        }
      }
    });

    const hits = body.hits.hits.map((item) => item._source);
    return hits;
  }

  async searchAll(text: string){
    const  bodyAll  = await this.elasticsearchService.search({
      index: this.index,
      body: {
        query: {
          match_all: {}, 
        },
      },
      size: 10000, 
    });
    const hitsAll = bodyAll.hits.hits.map((hit) => hit._source);
    return hitsAll;
  }

  async deleteAllData(): Promise<void> {
    await this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match_all: {},
        },
      },
    });
  }
}
