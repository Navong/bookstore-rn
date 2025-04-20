import { Document } from "mongoose";

export interface IBook {
    title: string;
    caption: string;
    image: string;
    rating: number;
    user: object;
    createdAt: Date;
    updatedAt: Date;
}

export type BookDocument = IBook & Document