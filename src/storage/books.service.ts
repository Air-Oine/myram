import { Injectable, EventEmitter } from '@angular/core';

import * as lodash from 'lodash';

import { StorageService } from './storage.service';

import { AuthorsService, AUTHOR_KEY } from './authors.service';
import { CollectionsService, COLLECTION_KEY } from './collections.service';

import { Author } from '../model/Author';
import { Book } from '../model/Book';
import { Collection } from '../model/Collection';

export const BOOK_KEY = 'book';

export const GROUPBY_COLLECTION = 'collection.name';

@Injectable()
export class BooksService {

    private booksWithFilter: Array<Array<Book>> = null;
    private books: Array<Array<Book>> = null;

    private observable: EventEmitter<{}> = null;

    constructor(
        private storageService: StorageService,
        private collectionsService: CollectionsService,
        private authorsService: AuthorsService) { 
        
    }

    /**
     * Handle data recuperation in DB for table Book
     * @param groupBy constant from DataService
     */
    require(groupBy: string = null) {
        //Need authors and collections datas
        this.authorsService.require();
        this.collectionsService.require();

        //Suscribe to books observable
		this.observable = this.storageService.getListObservable(BOOK_KEY);
		this.observable.subscribe(
			value => {
				let booksList: Array<Book> = value;
                
				for(let book of booksList) {
					//Get the author if not loaded yet
					if(book.author === null) {
						this.storageService.getObject(AUTHOR_KEY, book.authorId).then((author: Author) => {
                            book.author = author;
                        });
					}
					//Get the collection if not loaded yet
					if(book.collection === null && book.collectionId) {
						this.storageService.getObject(COLLECTION_KEY, book.collectionId).then((collection: Collection) => {
                            book.collection = collection;
                        });
					}
                }

                //Group list
                if(groupBy) {
                    this.books = lodash.values(lodash.groupBy(booksList, groupBy));
                }

                //Shawn list
				this.booksWithFilter = this.books;
			},
			error => console.log(error),
			() => console.log('done')
		);

		//Sort list by collection
		this.storageService.init(BOOK_KEY);
		this.storageService.loadList(BOOK_KEY);
    }

    /**
     * Add a new book (save in DB)
     * @param book 
     */
    add(book: Book) : Book {
        return this.storageService.addObject(BOOK_KEY, book);
    }

    /**
     * Update a book
     * @param book 
     */
    update(book: Book) {
        this.storageService.updateObject(BOOK_KEY, book);
    }

    /**
     * Delete a book
     * @param id 
     */
    delete(id: number) {
        this.storageService.deleteObjectById(BOOK_KEY, id);
    }

    /**
     * Return the list of books
     */
    getList() : Array<Array<Book>> {
        return this.books;
    }

    /**
     * Return the list of filtered books (with filter)
     */
    getFilteredList() : Array<Array<Book>> {
        return this.booksWithFilter;
    }

    /**
     * Set the order of the list of books
     * @param sortFields 
     */
    setSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(BOOK_KEY, sortFields);
    }

    /**
	 * Filter books list on some criteria : title, author and collection
	 * @param research 
	 */
    filter(research: string) : void {
        if (research) {
			research = research.trim().toLowerCase();

            this.booksWithFilter = [];

            //Iteration over books groups
            for(let booksGroup of this.books) {
                const filteredBooks = booksGroup.filter((item) => {
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
                });

                //At least one result
                if(filteredBooks.length > 0) {
                    this.booksWithFilter.push(filteredBooks);
                }
            }
		}
		else {
			this.cancelFilter();
		}
    }

    cancelFilter() {
        this.booksWithFilter = this.books;
    }
}
