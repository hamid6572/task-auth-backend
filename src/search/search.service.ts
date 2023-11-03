
import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

import { PostSearchBody } from './dto/post-search-body';
import { Post } from '../post/entities/post.entity';
import { CommentSearchBody } from './dto/comment-search-body';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class SearchService {
  indexPosts = 'posts'
  indexComments = 'comments'
  private readonly elasticsearchClient: Client;
  constructor() {
    this.elasticsearchClient = new Client({ node: 'http://localhost:9200' });
  }
 
  /**
   * Indexs post
   * @param post 
   */
  async indexPost(post: Post) {
    const { id, title, content }=  post;    
    const { firstName, lastName, email } = post.user;

    let postIndices = await this.elasticsearchClient.index<PostSearchBody>({
      index: this.indexPosts,
      body: { id, title, content, user: { firstName, lastName, email } }
    });

    return postIndices;
  }
 
  /**
   * Indexs comment
   * @param comment 
   * @returns  
   */
  async indexComment(comment: Comment) {
    const { id, text } = comment;  
    let commentIndices = await this.elasticsearchClient.index<CommentSearchBody>({
      index: this.indexComments,
      body: { 
        id, text, postId: comment.post.id
      }
    });
    return commentIndices;
  }

  /**
   * Searchs search service
   * @param text 
   * @returns search 
   */
  async search(text: string){
    const body = await this.elasticsearchClient.search({
      index: `${this.indexPosts},${this.indexComments}`,
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
              },
              {
                "wildcard": {
                  "text": `*${text}*`
                }
              }
            ]
          }
        }
      }
    });
        
    return body.hits.hits;
  }

  /**
   * Searchs all
   * @param text 
   */
  async searchAll(){
    const  bodyAll  = await this.elasticsearchClient.search({
      index: this.indexComments,
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

  async deletePost(postId: number) {
    return this.elasticsearchClient.deleteByQuery({
      index: this.indexPosts,
      body: {
        query: {
          term: {
            id: postId
          }       
        },
      },
    });
  }

  /**
   * Deletes comment
   * @param commentId 
   * @returns  
   */
  async deleteComment(commentIds) {
    return this.elasticsearchClient.deleteByQuery({
      index: this.indexComments,
      body: {
        query: {
          ids: {
            values: commentIds
          }
        },
      },
    });
  }


  /**
   * Updates search service
   * @param post 
   */
  async updatePost(post: Post) {
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

    return this.elasticsearchClient.updateByQuery({
      index: this.indexPosts,
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

  /**
   * Updates comment
   * @param comment 
   * @returns  
   */
  async updateComment(comment: Comment) {
    const newBody = {
      id: comment.id,
      text: comment.text,
    };

    const script = `
    ctx._source.id='${newBody.id}';
    ctx._source.text='${newBody.text}';
  `;

    return this.elasticsearchClient.updateByQuery({
      index: this.indexComments,
      body: {
        query: {
          match: {
            id: comment.id,
          },
        },
        script: {
          source: script,
        },
      },
    });
  }

  /**
   * Creates mappings
   * @returns  
   */
  async createMappings (){
    return this.elasticsearchClient.updateByQuery({
      index: this.indexPosts,
      script: {
        source: 'ctx._source.comments = params.comments', 
        params: {
          comments: {
            type: 'nested',
            properties: {
              text: {
                type: 'text',
              },
            },
          },
        },
      },
    });
  }
}