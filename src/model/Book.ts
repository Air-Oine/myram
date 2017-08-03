import { Author } from './Author'

export enum BookStatus {None, Wanted, Owned};

export class Book {
    
    constructor(
        public title?: string, 
        public author?: Author, 
        public collection: string = null,
        public gender: string = null,
        public status: BookStatus = BookStatus.None,
        public read: boolean = null) {

    }
}