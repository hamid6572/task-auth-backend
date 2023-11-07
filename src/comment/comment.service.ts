import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { CommentInput } from "./dto/input/comment-input";
import { CommentRepository } from "./comment.repository";
import { PostService } from "../post/post.service";
import { User } from "../user/entities/user.entity";
import { ReplyInput } from "./dto/input/reply-input";
import { Comment } from "./entities/comment.entity";
import { Post } from "../post/entities/post.entity";
import { SuccessResponse } from "../post/dto/success-response";
import { CommonRepositoryFactory } from "../common/common.repository";
import { CommonService } from "../common/common.service";

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    private readonly commonService: CommonService,
    ) {}

  /**
   * Addcomments comment service
   * @param {text, postId} 
   * @param user 
   * @returns addcomment 
   */
  async addcomment({text, postId}: CommentInput, user: User): Promise<SuccessResponse> {  
    const post: Post | null =  await this.postService.post(postId);
    if (!post) throw new BadRequestException("No post exists!");

    const comment = await this.commonService.insertEntity(Object.assign(new Comment(), { text, user }),Comment);
    if (!comment)
      throw new BadRequestException("No comments created, Something went Wrong!");

      return new SuccessResponse('Comment Inserted successfully'); 
    }

  /**
   * Comments comment service
   * @param id 
   * @returns comment 
   */
  async comment(id: number): Promise<Comment> {
    const comment: Comment | undefined = await this.commentRepository
      .createQueryBuilder('comment')
      .where({ id: id })
      .getOne();
    if (!comment) throw new BadRequestException("No comment exists!");
      
    comment.replies = await this.buildNestedReplies(comment);
    return comment;
  }

  /**
   * Get comments by post
   * @param postId 
   * @returns comments by post 
   */
  async commentsByPost(postId: number): Promise<Comment[]> {
    const post: Post | null =  await this.postService.post(postId);
    if (!post) throw new BadRequestException("No post exists!");

    const comments: Comment[] | null = await this.commentRepository
      .createQueryBuilder('comment')
      .where('post.id = :postId', { postId })
      .getMany();
    if (!comments) return [];

    for (const comment of comments)
      comment.replies = await this.buildNestedReplies(comment);
    return comments;
  }

  /**
   * Get comments service
   * @returns comments 
   */
  async comments(): Promise<Comment[]> {
    const comments: Comment[] = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.parent IS NULL') 
      .getMany();
  
    if (!comments) throw new BadRequestException("No comments exist!");  
    for (const comment of comments) {
      comment.replies = await this.buildNestedReplies(comment);
    }
    
    return comments;
  }
  
  /**
   * Builds nested replies
   * @param comment 
   * @returns nested replies 
   */
  private async buildNestedReplies(comment: Comment): Promise<Comment[]> {
    const replies: Comment[] = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.parent = :commentId', { commentId: comment.id })
      .getMany();
  
    if (replies.length > 0) {
      comment.replies = replies;
      for (const reply of replies) {
        await this.buildNestedReplies(reply);
      }
    }
  
    return comment.replies || [];
  }
  
  /**
   * Updates comment
   * @param id 
   * @param {text} 
   * @param user 
   * @returns comment 
   */
  async updateComment(id: number, {text}: CommentInput, user: User): Promise<SuccessResponse> {    
    const comment: Comment | undefined = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException("Comment not found or you don't have permission to edit it.");

    const updatedComment = await this.commonService.updateEntity(id, Object.assign(comment, { text, user }), Comment);
    if (!updatedComment)
      throw new BadRequestException("Unable to update comment, Something went Wrong!");

    return new SuccessResponse('Comment Update successfully'); 
  }

  /**
   * Deletes comment and replies by query
   * @param id 
   * @param user 
   * @returns comment and replies deleted by query 
   */
  async deleteCommentAndReplies(id: number, manager?: EntityManager): Promise<SuccessResponse> {
    const post: Post | null = await this.postService.post(id);
    if (!post) throw new BadRequestException("No post exists!");
    let queryBy = manager ? manager : this.commentRepository;

    const deleteResult = await queryBy
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('postId = :postId', { postId: id })
      .execute();
      
    if (deleteResult.affected === 0) 
      throw new BadRequestException("No Comment exists!");

    return new SuccessResponse('Comments deleted successfully'); 
  }

  /**
   * Adds a reply to a comment
   * @param data 
   * @param user 
   * @returns a reply to a comment 
   */
  async addReplyToComment(data: ReplyInput, user: User): Promise<Comment> {
    const post: Post | null =  await this.postService.post(data.postId);
    if (!post) throw new BadRequestException("No post exists!");

    const comment: Comment | undefined = await this.comment(data.commentId);
    if (!comment) throw new NotFoundException("Comment not found!");

    let parentComment: Comment | undefined = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.parent', 'parent') 
      .leftJoinAndSelect('parent.parent', 'grandparent')
      .where('comment.id = :commentId', { commentId: data.commentId })
      .getOne();
    if (!parentComment) throw new NotFoundException('Parent comment not found');

    // Restricting replies to double nested only
    if (parentComment?.parent?.parent) parentComment = parentComment.parent 

    return this.commentRepository.save({
      text: data.text,
      user,
      post,
      parent: parentComment,
    });
  }

  /**
   * Gets user by comment id
   * @param id 
   * @returns user by comment id 
   */
  async getUserByCommentId(id: number): Promise<User> {
    const comment: Comment | undefined = await this.commentRepository    
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where({ id })
        .getOne();
    if (!comment) throw new BadRequestException("No comment exists!");

    return comment.user;
  }

  /**
   * Gets post by comment id
   * @param id 
   * @returns post by comment id 
   */
  async getPostByCommentId(id: number): Promise<Post> {
    const comment: Comment | undefined = await this.commentRepository    
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.post', 'post')
        .where({ id })
        .getOne();
    if (!comment) throw new BadRequestException("No comment exists!");

    return comment.post;
  }
}
