import { Author } from './Author'
import { Collection } from './Collection'

export enum BookStatus {None, Wanted, Owned};

export class Book {
    public id: number = null;
    
    constructor(
        public title?: string, 
        public author?: Author, 
        public authorId: number = null, 
        public collection: Collection = null,
        public collectionId: number = null,
        public type: string = null,
        public gender: string = null,
        public status: BookStatus = BookStatus.None,
        public read: boolean = null) {

    }
}