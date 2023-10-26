
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
 
  /**
   * Indexs post
   * @param post 
   */
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
    //await this.deleteAllData()
    return postIndices;
  }
 
  /**
   * Searchs search service
   * @param text 
   */
  async search(text: string){
    const body = await this.elasticsearchService.search({
      index: this.index,
      body: {
        "query": {
          "bool": {
            "should": [
              {
                "wildcard": {
                  "title": `*${text}*`
                }
              },
              {
                "wildcard": {
                  "content": `*${text}*`
                }
              },
              {
                "wildcard": {
                  "user.firstName": `*${text}*`
                }
              },
              {
                "wildcard": {
                  "user.lastName": `*${text}*`
                }
              },
              {
                "wildcard": {
                  "user.email": `*${text}*`
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

  /**
   * Searchs all
   * @param text 
   */
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

  /**
   * Deletes search service
   * @param postId 
   * @returns delete 
   */
  async delete(postId: number): Promise<void> {
    await this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        "query": {
          "match": {
            "id": postId
          }        
        },
      },
    });
  }

  /**
   * Updates search service
   * @param post 
   */
  async update(post: Post) {
    const newBody: PostSearchBody = {
      id: post.id,
      title: post.title,
      content: post.content,
      user: post.user,
    };

    const script = `
    ctx._source.id='${newBody.id}';
    ctx._source.title='${newBody.title}';
    ctx._source.content='${newBody.content}';
  `;

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: post.id,
          },
        },
        script: {
          source: script,
        },
      },
    });
  }
}
