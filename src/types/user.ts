import { IBase } from './base.js';

export interface IUser extends IBase {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
