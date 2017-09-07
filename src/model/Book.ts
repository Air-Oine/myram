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
        public loanId: number = null,
        public read: boolean = null,
        public volume: number = null,
        public coverSmallUrl: string = null,
        public coverMediumUrl: string = null,
        public coverLargeUrl: string = null) {

    }
}