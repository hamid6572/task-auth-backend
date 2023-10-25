import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { postInput } from "./dto/input/post-input";
import { PostRepository } from "./post.repository";
import { PostPaginationInput } from "./dto/input/post-pagination-input";
import { User } from "../user/entities/user.entity";
import { SearchInput } from "./dto/input/search-input";
import SearchService from "../search/search.service";
import { UserRepository } from "../user/user.repository";
import { Post } from "./entities/post.entity";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly searchService: SearchService, 
 
    ) {}

  async addpost(data: postInput, user: User) {    
    const post = await this.postRepository.create({...data, user:user});
    if (!post)  throw new BadRequestException("No posts created, Something went Wrong!");

    const userObject = await this.userRepository.findOne({ where: { id: user.id } });
    await this.postRepository.save(post);
  
    post.user.firstName = userObject.firstName;
    post.user.lastName = userObject.lastName;
    post.user.email = userObject.email;

    this.searchService.indexPost(post);
    return post;
  }

  async post(id: number) {
    const post = await this.postRepository
        .createQueryBuilder('post')
        .where({id: Number(id)})
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.comments', 'comment')
        .getOne()
    if (!post) throw new BadRequestException("No post exists!");

    return post;
  }

  async posts() {
    const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.comments', 'comment')
        .getMany()
    if (!posts) throw new BadRequestException("No post exists!");
    
    return posts;
  }

  async updatePost(id: number ,data: postInput,user: User){
    const post = await this.postRepository.findOne({ where: { id, user } });
    if (!post)  throw new NotFoundException("Post not found or you don't have permission to edit it.");
  
    post.title = data.title;
    post.content = data.content;
    const updatedPost = await this.postRepository.save(post);
  
    return updatedPost;
  }

  async deletePost(id: number,user: User){
    const post = await this.postRepository.findOne({ where: { id, user } });
    if (!post) throw new NotFoundException("Post not found or you don't have permission to delete it.");
    const deletedPost = await this.postRepository.remove(post);

    return deletedPost;
  }

  async searchPosts(input: string){
    const results = await this.searchService.search(input) as Post[];
    const ids = results.map(result => result.id);    
    if (!ids.length) return [];

    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id IN (:...ids)', { ids })
      .getMany();
  }

  async searchPostsByFilters(input: SearchInput){
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

  async searchPostsByQuery(input: string){
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

  async paginatedPosts(paginationInput: PostPaginationInput){
    const { page, itemsPerPage } = paginationInput;
    const skip = (page - 1) * itemsPerPage;
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .skip(skip)
      .take(itemsPerPage)
      .getMany();
  }
}
