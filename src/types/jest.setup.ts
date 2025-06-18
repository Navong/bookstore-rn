import { Model } from 'mongoose';
import { UserDocument } from '../types/userType';

type MockModel<T> = {
  [K in keyof Model<T>]: jest.Mock;
} & {
  prototype: { save: jest.Mock };
  new (): Partial<T>;
};

export type MockUserModel = MockModel<UserDocument>;