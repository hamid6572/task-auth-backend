import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Like } from 'typeorm';

import { postInput } from './dto/input/post-input';
import { PostRepository } from './post.repository';
import { PostPaginationInput } from './dto/input/post-pagination-input';
import { User } from '../user/entities/user.entity';
import { SearchInput } from './dto/input/search-input';
import { UserRepository } from '../user/user.repository';
import { Post, PostBuilder } from './entities/post.entity';
import { SearchService } from '../search/search.service';
import { Comment } from '../comment/entities/comment.entity';
import { CommonService } from '../common/common.service';
import { SuccessResponse } from './dto/success-response';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly searchService: SearchService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Add posts post service
   * @param data
   * @param user
   * @returns added post
   */
  async addPost(
    { title, content }: postInput,
    { id }: User,
  ): Promise<SuccessResponse> {
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
   * Get a post by its ID
   * @param id
   * @returns a post
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
   * Get all posts
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
   * Update a post
   * @param id
   * @param data
   * @param user
   * @returns updated post
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
   * Delete a post
   * @param id
   * @param manager
   * @returns deleted post
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
   * Search for posts
   * @param input
   * @returns matching posts
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
        //comment already there with post
        if (!postMap.get(postId).comments) postMap.get(postId).comments = [];
        postMap.get(postId).comments.push(result._source);
      } else if (result._index === 'comments' && post) {
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
   * Search for posts by filters
   * @param input
   * @returns matching posts
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
   * Search for posts by query
   * @param input
   * @returns matching posts
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
   * Get paginated posts
   * @param paginationInput
   * @returns paginated posts
   */
  async paginatedPosts(paginationInput: PostPaginationInput): Promise<Post[]> {
    const { page, itemsPerPage } = paginationInput;

    //keyset
    return this.postRepository
      .createQueryBuilder('post')
      .where('id > :value', { value: page })
      .take(itemsPerPage)
      .orderBy('id')
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
   * Get user by post id
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
