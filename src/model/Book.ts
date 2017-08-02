import { Author } from './Author'

export enum BookStatus {Wanted, Owned, None};

export class Book {
    
    constructor(
        public title: string, 
        public author: Author, 
        public collection: string = null,
        public gender: string = null,
        public status: BookStatus = BookStatus.None,
        public read: boolean = null) {

    }
}