import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { postInput } from "./dto/input/post-input";
import { PostRepository } from "./post.repository";
import { PostPaginationInput } from "./dto/input/post-pagination-input";
import { User } from "../user/entities/user.entity";
import { SearchInput } from "./dto/input/search-input";
import { UserRepository } from "../user/user.repository";
import { Post } from "./entities/post.entity";
import { SearchService } from "../search/search.service";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly searchService: SearchService, 
 
  ) {}

  /**
   * Addposts post service
   * @param data 
   * @param user 
   * @returns addpost 
   */
  async addPost(data: postInput, { id }: User) : Promise<Post> {    
    const user = await this.userRepository.findOne({ where: { id } });
    const post = this.postRepository.create({...data, user});
    const postSaved = await this.postRepository.save(post);
    if (!postSaved)  throw new BadRequestException("No posts created, Something went Wrong!");

    return post;
  }

  /**
   * Posts post service
   * @param id 
   * @returns post 
   */
  async post(id: number) : Promise<Post> {
    const post = await this.postRepository
        .createQueryBuilder('post')
        .where({id: Number(id)})
        .leftJoinAndSelect('post.comments', 'comment')
        .getOne()
    if (!post) throw new BadRequestException("No post exists!");

    return post;
  }

  /**
   * Posts post service
   * @returns posts 
   */
  async posts()  : Promise<Post[]> {
    const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.comments', 'comment')
        .getMany()
    const results = await this.searchService.searchAll();
    console.log("results===>", results);

    if (!posts) throw new BadRequestException("No post exists!");
    
    return posts;
  }
  
  /**
   * Updates post
   * @param id 
   * @param data 
   * @param user 
   * @returns post 
   */
  async updatePost(id: number ,data: postInput, user: User) : Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post)  throw new NotFoundException("Post not found or you don't have permission to edit it.");
  
    post.title = data.title;
    post.content = data.content;
    const updatedPost = await this.postRepository.save(post);  

    return updatedPost;
  }

  /**
   * Deletes post
   * @param id 
   * @param user 
   * @returns post 
   */
  async deletePost(id: number,user: User) : Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException("Post not found or you don't have permission to delete it.");

    const deletedPost = await this.postRepository.remove(post);    

    return deletedPost;
  }
  
/**
   * Searchs posts
   * @param input 
   * @returns posts 
   */
  async searchPosts(input: string) : Promise<Post[]> {
    const results:any = await this.searchService.search(input);
    let posts = []
    
    for (let result of results){
      if (result._index === 'comments') {
        const post = await this.postRepository.findOne({ where: { id:result._source.postId } });
        let updatedPost = { ...post, comments: [...(post.comments || []), result._source] };
        
        posts.push(updatedPost)
      }
      else posts.push(result._source);
    }

    return posts
  }

  /**
   * Searchs posts by filters
   * @param input 
   * @returns posts by filters 
   */
  async searchPostsByFilters(input: SearchInput) : Promise<Post[]> {
    const { firstName, lastName, email, title } = input;    
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where(qb => {
        if (firstName) {
          qb.orWhere('user.firstName LIKE :firstName', { firstName: `%${firstName}%` });
        }
        if (lastName) {
          qb.orWhere('user.lastName LIKE :lastName', { lastName: `%${lastName}%` });
        }
        if (email) {
          qb.orWhere('user.email LIKE :email', { email: `%${email}%` });
        }
        if (title) {
          qb.orWhere('post.title LIKE :title', { title: `%${title}%` });
        }
      })
      .getMany();
        
    return posts;
  }

  /**
   * Searchs posts by query
   * @param input 
   * @returns posts by query 
   */
  async searchPostsByQuery(input: string) : Promise<Post[]> {
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
   * Paginated posts
   * @param paginationInput 
   * @returns posts 
   */
  async paginatedPosts(paginationInput: PostPaginationInput) : Promise<Post[]> {
    const { page, itemsPerPage } = paginationInput;
    const skip = (page - 1) * itemsPerPage;
    return this.postRepository
      .createQueryBuilder('post')
      .skip(skip)
      .take(itemsPerPage)
      .getMany();
  }

  /**
   * Gets user by post id
   * @param id 
   * @returns user by post id 
   */
  async getUserByPostId(id: number)  : Promise<User> {
    const post = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where({ id })
        .getOne()
    if (!post) throw new BadRequestException("No user exists!");

    return post.user;
  }
}
