import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Like } from 'typeorm';

import { postInput } from './dto/input/post-input.js';
import { PostRepository } from './post.repository.js';
import { PaginationInput } from './dto/input/post-pagination-input.js';
import { User } from '../user/entities/user.entity.js';
import { SearchInput } from './dto/input/search-input.js';
import { UserRepository } from '../user/user.repository.js';
import { Post, PostBuilder } from './entities/post.entity.js';
import { SearchService } from '../search/search.service.js';
import { Comment } from '../comment/entities/comment.entity.js';
import { CommonService } from '../common/common.service.js';
import { SuccessResponse } from './dto/success-response.js';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly searchService: SearchService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Params post service
   * @param { title, content }
   * @param { id }
   * @returns post
   */
  async addPost(
    { title, content, image }: postInput,
    { id }: User,
  ): Promise<SuccessResponse> {
    const { createReadStream, filename } = await image;
    console.log(image);

    const fileUpload = new Promise(async resolve => {
      createReadStream()
        .pipe(createWriteStream(join(process.cwd(), `./uploads/${filename}`)))
        .on('finish', () =>
          resolve({
            title,
            content,
            image: filename,
          }),
        )
        .on('error', () => {
          new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
        });
    });
    console.log('fileUpload==>', fileUpload);

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(
        "User not found or you don't have permission to create post.",
      );

    const newPost = new PostBuilder()
      .setTitle(title)
      .setContent(content)
      .setUser(user)
      .build();

    const postSaved = await this.commonService.insertEntity(newPost, Post);
    if (!postSaved)
      throw new BadRequestException('No posts created, Something went Wrong!');

    return new SuccessResponse(
      'Post Created successfully',
      postSaved.generatedMaps[0].id,
    );
  }

  /**
   * Params post service
   * @param id
   * @returns post
   */
  async post(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      relations: {
        comments: true,
      },
      where: { id },
    });
    if (!post) throw new BadRequestException('No post exists!');

    return post;
  }

  /**
   * Returns post service
   * @returns posts
   */
  async posts(): Promise<Post[]> {
    const posts = await this.postRepository.find({
      relations: {
        comments: true,
      },
    });
    const results = await this.searchService.searchAll();
    if (!posts) throw new BadRequestException('No post exists!');

    return posts;
  }

  /**
   * Params post service
   * @param id
   * @param { title, content }
   * @param user
   * @returns post
   */
  async updatePost(
    id: number,
    { title, content }: postInput,
    user: User,
  ): Promise<SuccessResponse> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post)
      throw new NotFoundException(
        "Post not found or you don't have permission to edit it.",
      );

    const updatedPost = new PostBuilder()
      .update(post)
      .setTitle(title)
      .setContent(content)
      .setUser(user)
      .build();

    const resultantPost = await this.commonService.updateEntity(
      id,
      updatedPost,
      Post,
    );
    if (!resultantPost)
      throw new NotFoundException(
        'Unable to update post, Something went wrong.',
      );

    return new SuccessResponse('Post Updated successfully', updatedPost.id);
  }

  /**
   * Params post service
   * @param id
   * @param manager
   * @returns post
   */
  async deletePost(id: number, manager: EntityManager): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post)
      throw new NotFoundException(
        "Post not found or you don't have permission to delete it.",
      );

    const deletedPost = await manager.remove(post);
    return deletedPost;
  }

  /**
   * Params post service
   * @param input
   * @returns posts
   */
  async searchPosts(input: string): Promise<Post[]> {
    let fieldsToSearch: string[] = [
      'title',
      'content',
      'user.firstName',
      'user.lastName',
      'user.email',
      'text',
    ];
    const results = await this.searchService.search(
      input,
      fieldsToSearch,
      'posts',
      'comments',
    );
    const posts = [];
    const postMap = new Map();
    console.log('results', results);

    for (const result of results.hits.hits) {
      const postId = result._source.postId;

      const post = await this.postRepository.findOne({
        select: {
          id: true,
          title: true,
          content: true,
        },
        where: { id: postId },
      });

      if (result._index === 'comments' && postMap.has(postId)) {
        if (!postMap.get(postId).comments) postMap.get(postId).comments = [];

        //comment already there with post
        postMap.get(postId).comments?.push(result._source);
      } else if (result._index === 'comments' && post) {
        if (!post.comments) post.comments = [];
        //pushing post of comment with searched text
        const { id, text } = result._source;
        post.comments?.push(Object.assign(new Comment(), { id, text }));

        postMap.set(postId, post);
      } else if (result._index === 'posts' && !postMap.has(result._source.id)) {
        // pushing post if not already pushed from comments searched
        postMap.set(result._source.id, result._source);
      }
    }

    posts.push(...Array.from(postMap.values()));
    return posts;
  }

  /**
   * Params post service
   * @param {
   *     firstName,
   *     lastName,
   *     email,
   *     title,
   *   }
   * @returns posts by filters
   */
  async searchPostsByFilters({
    firstName,
    lastName,
    email,
    title,
  }: SearchInput): Promise<Post[]> {
    const posts = await this.postRepository.find({
      select: {
        id: true,
        title: true,
        content: true,
      },
      where: [
        { title: Like(`%${title}%`) },
        { user: { firstName: Like(`%${firstName}%`) } },
        { user: { lastName: Like(`%${lastName}%`) } },
        { user: { email: Like(`%${email}%`) } },
      ],
      relations: {
        user: true,
      },
    });

    return posts;
  }

  /**
   * Params post service
   * @param input
   * @returns posts by query
   */
  async searchPostsByQuery(input: string): Promise<Post[]> {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .orWhere('user.firstName LIKE :firstName', { firstName: `%${input}%` })
      .orWhere('user.lastName LIKE :lastName', { lastName: `%${input}%` })
      .orWhere('user.email LIKE :email', { email: `%${input}%` })
      .orWhere('post.title LIKE :title', { title: `%${input}%` })
      .getMany();

    return posts;
  }

  /**
   * Params post service
   * @param paginationInput
   * @returns posts
   */
  async paginatedPosts(paginationInput: PaginationInput): Promise<Post[]> {
    const { page, itemsPerPage } = paginationInput;

    //keyset
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.user', 'user')
      .skip(page)
      .take(itemsPerPage)
      .orderBy('post.createdAt')
      .getMany();

    //offset
    // const skip = (page - 1) * itemsPerPage;
    // return this.postRepository
    //   .createQueryBuilder('post')
    //   .skip(skip)
    //   .take(itemsPerPage)
    //   .getMany();
  }

  /**
   * Params post service
   * @param id
   * @returns user by post id
   */
  async getUserByPostId(id: number): Promise<User> {
    const post = await this.postRepository.findOne({
      relations: {
        user: true,
      },
      where: { id },
    });
    if (!post) throw new BadRequestException('No user exists!');

    return post.user;
  }
}
