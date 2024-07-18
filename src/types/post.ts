import { IBase } from './base.js';
import { IComment } from './comment.js';
import { IUser } from './user.js';

export interface IPost extends IBase {
  id: number;
  title: string;
  content: string;
  user: IUser;
  status: string;
  comments: IComment[];
}
