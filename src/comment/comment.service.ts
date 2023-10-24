import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { CommentInput } from "./dto/input/comment-input";
import { CommentRepository } from "./comment.repository";
import { PostService } from "../post/post.service";
import { User } from "../user/entities/user.entity";
import { ReplyInput } from "./dto/input/reply-input";
import { Comment } from "./entities/comment.entity";

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService
  ) {}

  async addcomment(data: CommentInput, user: User) {  
    const post =  await  this.postService.post(data.postId)
    if (!post) throw new BadRequestException("No post exists!");

    const comment = await this.commentRepository.save({...data, user:user, post: post});
    if (!comment)
      throw new BadRequestException("No comments created, Something went Wrong!");

    return comment;
  }

  async comment(id: number) {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .where({id: id})
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .getOne()
    if (!comment) throw new BadRequestException("No comment exists!");
      
    comment.replies = await this.buildNestedReplies(comment);
    return comment;
  }

  async commentsByPost(postId: number) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .where('post.id = :postId', { postId })
      .getMany()
    if (!comments) return null;
      
    for (const comment of comments)
      comment.replies = await this.buildNestedReplies(comment);
    return comments;
  }

  async comments() {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.parent IS NULL') 
      .getMany();
  
    if (!comments) throw new BadRequestException("No comments exist!");  
    for (const comment of comments) {
      comment.replies = await this.buildNestedReplies(comment);
    }
  //  console.dir(comments, {depth: null});

    return comments;
  }
  
  private async buildNestedReplies(comment: Comment): Promise<Comment[]> {
    const replies = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
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
  
  async updateComment(id: number, data: CommentInput, user: User){    
    const comment = await this.commentRepository.findOne({ where: { id, user } });
    if (!comment) throw new NotFoundException("Comment not found or you don't have permission to edit it.");

    comment.text = data.text;
    return this.commentRepository.save(comment);
  }

  async deleteCommentAndReplies(id: number, user: User) {
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

  async addReplyToComment(data: ReplyInput, user: User) {
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
}
