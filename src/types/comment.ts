import { IBase } from './base.js';
import { IPost } from './post.js';
import { IUser } from './user.js';

export interface IComment extends IBase {
  id: number;
  text: string;
  post: IPost;
  user: IUser;
  replies: Comment[];
}

export interface IReply extends IBase {
  id: number;
  text: string;
  post: IPost;
  user: IUser;
  replies: Comment[];
}
