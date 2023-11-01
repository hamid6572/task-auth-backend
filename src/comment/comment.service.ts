import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { CommentInput } from "./dto/input/comment-input";
import { CommentRepository } from "./comment.repository";
import { PostService } from "../post/post.service";
import { User } from "../user/entities/user.entity";
import { ReplyInput } from "./dto/input/reply-input";
import { Comment } from "./entities/comment.entity";
import { Post } from "../post/entities/post.entity";

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService
  ) {}

  /**
   * Addcomments comment service
   * @param data 
   * @param user 
   * @returns addcomment 
   */
  async addcomment(data: CommentInput, user: User): Promise<Comment> {  
    const post =  await  this.postService.post(data.postId)
    if (!post) throw new BadRequestException("No post exists!");

    const comment = await this.commentRepository.save({...data, user:user, post: post});
    if (!comment)
      throw new BadRequestException("No comments created, Something went Wrong!");

    return comment;
  }

  /**
   * Comments comment service
   * @param id 
   * @returns comment 
   */
  async comment(id: number) : Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .where({id: id})
      .getOne()
    if (!comment) throw new BadRequestException("No comment exists!");
      
    comment.replies = await this.buildNestedReplies(comment);
    return comment;
  }

  /**
   * Comments by post
   * @param postId 
   * @returns by post 
   */
  async commentsByPost(postId: number) : Promise<Comment[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('post.id = :postId', { postId })
      .getMany()
    if (!comments) return null;
      
    for (const comment of comments)
      comment.replies = await this.buildNestedReplies(comment);
    return comments;
  }

  /**
   * Comments comment service
   * @returns comments 
   */
  async comments() : Promise<Comment[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.parent IS NULL') 
      .getMany();
  
    if (!comments) throw new BadRequestException("No comments exist!");  
    for (const comment of comments) {
      comment.replies = await this.buildNestedReplies(comment);
    }
  //  console.dir(comments, {depth: null});

    return comments;
  }
  
  /**
   * Builds nested replies
   * @param comment 
   * @returns nested replies 
   */
  private async buildNestedReplies(comment: Comment): Promise<Comment[]> {
    const replies = await this.commentRepository
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
   * @param data 
   * @param user 
   * @returns comment 
   */
  async updateComment(id: number, data: CommentInput, user: User) : Promise<Comment>{    
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException("Comment not found or you don't have permission to edit it.");

    comment.text = data.text;
    return this.commentRepository.save(comment);
  }

  /**
   * Deletes comment and replies
   * @param id 
   * @param user 
   * @returns comment and replies 
   */
  async deleteCommentAndReplies(id: number, user: User) : Promise<Comment[]>{
    const comments = await this.commentsByPost(id);
    if (!comments) throw new NotFoundException("Comment not found or you don't have permission to delete it.");
  
    for (const comment of comments) {
      await this.deleteCommentAndRepliesRecursive(comment);
    }
  
    return comments;
  }
  
  async deleteCommentAndRepliesRecursive(comment: Comment) {
    if (comment.replies) {
      for (const reply of comment.replies) {
        await this.deleteCommentAndRepliesRecursive(reply);
      }
    }
    await this.commentRepository.remove(comment);
  }

  /**
   * Deletes comment and replies by query
   * @param id 
   * @param user 
   * @returns comment and replies by query 
   */
  async deleteCommentAndRepliesByRawQuery(id: number, user: User) : Promise<Comment[]>{
    const rawQuery = `
      WITH RECURSIVE CommentHierarchy AS (
        SELECT comment.id, comment.text, comment."parentId", comment."postId"
        FROM public.comment comment
        WHERE comment."postId" = ${id}
        UNION
        SELECT child.id,  child.text, child."parentId", child."postId"
        FROM CommentHierarchy ch, public.comment child
        WHERE child."parentId" = ch.id
      )
      DELETE FROM public.comment
      USING CommentHierarchy
      WHERE public.comment.id = CommentHierarchy.id;
    `;
    const results = await this.commentRepository.query(rawQuery);

    return results; 
  }

  /**
   * Adds reply to comment
   * @param data 
   * @param user 
   * @returns reply to comment 
   */
  async addReplyToComment(data: ReplyInput, user: User): Promise<Comment> {
    const post =  await  this.postService.post(data.postId)
    if (!post) throw new BadRequestException("No post exists!");

    const comment = await this.comment(data.commentId);
    if (!comment) throw new NotFoundException("Comment not found!");

    let parentComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.parent', 'parent') 
      .leftJoinAndSelect('parent.parent', 'grandparent')
      .where('comment.id = :commentId', { commentId: data.commentId })
      .getOne();
    if (!parentComment) throw new NotFoundException('Parent comment not found');

    //restricting replies to double nested only
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
  async getUserByCommentId(id: number)  : Promise<User> {
    const comment = await this.commentRepository    
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where({ id })
        .getOne()
    if (!comment) throw new BadRequestException("No comment exists!");

    return comment.user;
  }

  /**
   * Gets post by comment id
   * @param id 
   * @returns post by comment id 
   */
  async getPostByCommentId(id: number)  : Promise<Post> {
    const comment = await this.commentRepository    
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.post', 'post')
        .where({ id })
        .getOne()
    if (!comment) throw new BadRequestException("No comment exists!");

    return comment.post;
  }
}
