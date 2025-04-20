import { Document } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = Document & IUser & IUserMethods;