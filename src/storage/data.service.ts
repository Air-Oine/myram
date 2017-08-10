import { Injectable, EventEmitter } from '@angular/core';

import { StorageService, AUTHOR_KEY, BOOK_KEY, COLLECTION_KEY } from './storage.service';
import { Author } from '../model/Author';
import { Book } from '../model/Book';
import { Collection } from '../model/Collection';


@Injectable()
export class DataService {

    private booksWithFilter: Array<Book> = null;
    private books: Array<Book> = null;
    private authors: Array<Author> = null;
    private collections: Array<Collection> = null;

    private observables: Array<EventEmitter<{}>> = Array<EventEmitter<any>>();

    constructor(private storageService: StorageService) { 
        
    }

    //AUTHOR

    /**
     * Handle data recuperation in DB for table Author
     */
    requireAuthors() {
        if(this.authors == null) {
            this.observables[AUTHOR_KEY] = this.storageService.getListObservable(AUTHOR_KEY);
            this.observables[AUTHOR_KEY].subscribe(
                value => this.authors = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.storageService.init(AUTHOR_KEY, ['lastName', 'firstName']);
            this.storageService.loadList(AUTHOR_KEY);
        }
    }

    /**
     * Return the list of authors
     */
    getAuthors() : Array<Author> {
        return this.authors;
    }

    //COLLECTION

    /**
     * Handle data recuperation in DB for table Collection
     */
    requireCollections() {
        if(this.collections == null) {
            this.observables[COLLECTION_KEY] = this.storageService.getListObservable(COLLECTION_KEY);
            this.observables[COLLECTION_KEY].subscribe(
                value => this.collections = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.storageService.init(COLLECTION_KEY, ['name']);
            this.storageService.loadList(COLLECTION_KEY);
        }
    }

    /**
     * Return the list of collections
     */
    getCollections() : Array<Collection> {
        return this.collections;
    }

    //BOOK

    /**
     * Handle data recuperation in DB for table Book
     */
    requireBooks() {
        //Need authors and collections datas
        this.requireAuthors();
        this.requireCollections();

		this.observables[BOOK_KEY] = this.storageService.getListObservable(BOOK_KEY);
		this.observables[BOOK_KEY].subscribe(
			value => {
				this.booksWithFilter = value;
				//Get related table if not defined
				for(let book of this.booksWithFilter) {
					//Get the author if not loaded yet
					if(book.author === null) {
						book.author = this.storageService.getElement(AUTHOR_KEY, book.authorId);
					}
					//Get the collection if not loaded yet
					if(book.collection === null && book.collectionId) {
						book.collection = this.storageService.getElement(COLLECTION_KEY, book.collectionId);
					}
				}

				//Shawn list
				this.books = this.booksWithFilter;
			},
			error => console.log(error),
			() => console.log('done')
		);

		//Sort list by collection
		this.storageService.init(BOOK_KEY, ['collection']);
		this.storageService.loadList(BOOK_KEY);
    }

    /**
     * Return the list of books
     */
    getBooks() : Array<Book> {
        return this.books;
    }

    /**
     * Return the list of filtered books (with filter)
     */
    getFilteredBooks() : Array<Book> {
        return this.booksWithFilter;
    }

    /**
	 * Filter books list on some criteria : title, author and collection
	 * @param research 
	 */
    filterBook(research: string) : void {
        if (research) {
			research = research.trim().toLowerCase();

			this.booksWithFilter = this.books.filter((item) => {
				const titleFound = item.title.toLowerCase().indexOf(research) > -1;
				let collectionFound = false;
				let authorFirstNameFound = false;
				let authorLastNameFound = false;

				if(item.author) {
					authorFirstNameFound = item.author.firstName.toLowerCase().indexOf(research) > -1;
					authorLastNameFound = item.author.lastName.toLowerCase().indexOf(research) > -1;
				}
				if(item.collection) {
					collectionFound = item.collection.name.toLowerCase().indexOf(research) > -1;
				}

				return titleFound || collectionFound || authorFirstNameFound || authorLastNameFound;
			})
		}
		else {
			this.cancelFilterBook();
		}
    }

    cancelFilterBook() {
        this.booksWithFilter = this.books;
    }
}