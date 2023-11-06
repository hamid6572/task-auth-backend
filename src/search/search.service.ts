import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

import { PostSearchBody } from './dto/post-search-body';
import { Post } from '../post/entities/post.entity';
import { CommentSearchBody } from './dto/comment-search-body';
import { Comment } from '../comment/entities/comment.entity';
import { DeleteByQueryResponse, SearchResponse, UpdateByQueryResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types';
import { ElasticSearchResponse } from './dto/search-response';

@Injectable()
export class SearchService {
  indexPosts = 'posts';
  indexComments = 'comments';
  private readonly elasticsearchClient: Client;

  constructor() {
    this.elasticsearchClient = new Client({ node: 'http://localhost:9200' });
  }

  /**
   * Index a post
   * @param post
   */
  async indexPost(post: Post): Promise<WriteResponseBase> {
    const { id, title, content } = post;
    const { firstName, lastName, email } = post.user;

    const postIndices = await this.elasticsearchClient.index<PostSearchBody>({
      index: this.indexPosts,
      body: { id, title, content, user: { firstName, lastName, email } },
    });

    return postIndices;
  }

  /**
   * Index a comment
   * @param comment
   * @returns
   */
  async indexComment(comment: Comment): Promise<WriteResponseBase> {
    const { id, text } = comment;
    const commentIndices = await this.elasticsearchClient.index<CommentSearchBody>({
      index: this.indexComments,
      body: {
        id,
        text,
        postId: comment.post.id,
      },
    });

    return commentIndices;
  }


  /**
   * Searchs search service
   * @param text 
   * @returns search 
   */
  async search(text: string): Promise<SearchResponse<ElasticSearchResponse>> {
    const body = await this.elasticsearchClient.search<ElasticSearchResponse>({
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
        
    return body;
  }

  /**
   * Search for all items
   * @param text
   */
  async searchAll(): Promise<SearchResponse<ElasticSearchResponse>> {
    const bodyAll = await this.elasticsearchClient.search<ElasticSearchResponse>({
      index: this.indexComments,
      body: {
        query: {
          match_all: {},
        },
      },
      size: 10000,
    });
    return bodyAll;
  }

  /**
   * Delete a post
   * @param postId
   * @returns delete
   */
  async deletePost(postId: number): Promise<DeleteByQueryResponse> {
    return this.elasticsearchClient.deleteByQuery({
      index: this.indexPosts,
      body: {
        query: {
          term: {
            id: postId,
          },
        },
      },
    });
  }

  /**
   * Delete a comment
   * @param commentIds
   * @returns
   */
  async deleteComment(commentIds: string[]): Promise<DeleteByQueryResponse> {
    return this.elasticsearchClient.deleteByQuery({
      index: this.indexComments,
      body: {
        query: {
          ids: {
            values: commentIds,
          },
        },
      },
    });
  }

  /**
   * Update a post
   * @param post
   */
  async updatePost(post: Post): Promise<UpdateByQueryResponse> {
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
   * Update a comment
   * @param comment
   * @returns
   */
  async updateComment(comment: Comment): Promise<UpdateByQueryResponse> {
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
   * Create mappings
   * @returns
   */
  async createMappings(): Promise<unknown> {
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