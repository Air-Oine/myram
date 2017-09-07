import { Injectable, EventEmitter } from '@angular/core';

import * as lodash from 'lodash';

import { StorageService } from './storage.service';
import { Author } from '../model/Author';
import { Friend } from '../model/Friend';
import { Book } from '../model/Book';
import { Collection } from '../model/Collection';
import { Loan } from '../model/Loan';

export const GROUPBY_COLLECTION = 'collection.name';

export const AUTHOR_KEY = 'author';
export const BOOK_KEY = 'book';
export const COLLECTION_KEY = 'collection';
export const FRIEND_KEY = 'friend';
export const LOAN_KEY = 'loan';

@Injectable()
export class DataService {

    private booksWithFilter: Array<Array<Book>> = null;
    private books: Array<Array<Book>> = null;
    private authors: Array<Author> = null;
    private friends: Array<Friend> = null;
    private collections: Array<Collection> = null;
    private loans: Array<Loan> = null;

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

            this.setAuthorsSortFields(['lastName', 'firstName']);
            this.storageService.init(AUTHOR_KEY);
            this.storageService.loadList(AUTHOR_KEY);
        }
    }

    /**
     * Return the list of authors
     */
    getAuthors() : Array<Author> {
        return this.authors;
    }

    /**
     * Set the order of the list of authors
     * @param sortFields 
     */
    setAuthorsSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(AUTHOR_KEY, sortFields);
    }

    //LOAN

    /**
     * Handle data recuperation in DB for table Loan
     */
    requireLoans() {
        if(this.loans == null) {
            this.observables[LOAN_KEY] = this.storageService.getListObservable(LOAN_KEY);
            this.observables[LOAN_KEY].subscribe(
                value => this.loans = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.setLoansSortFields(['date']);
            this.storageService.init(LOAN_KEY);
            this.storageService.loadList(LOAN_KEY);
        }
    }

    /**
     * Return the list of loans
     */
    getLoans() : Array<Loan> {
        return this.loans;
    }

    /**
     * Set the order of the list of loans
     * @param sortFields 
     */
    setLoansSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(LOAN_KEY, sortFields);
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

            this.setCollectionsSortFields(['name']);
            this.storageService.init(COLLECTION_KEY);
            this.storageService.loadList(COLLECTION_KEY);
        }
    }

    /**
     * Return the list of collections
     */
    getCollections() : Array<Collection> {
        return this.collections;
    }

    /**
     * Set the order of the list of collections
     * @param sortFields 
     */
    setCollectionsSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(COLLECTION_KEY, sortFields);
    }

    //BOOK

    /**
     * Handle data recuperation in DB for table Book
     * @param groupBy constant from DataService
     */
    requireBooks(groupBy: string = null) {
        //Need authors and collections datas
        this.requireAuthors();
        this.requireCollections();

		this.observables[BOOK_KEY] = this.storageService.getListObservable(BOOK_KEY);
		this.observables[BOOK_KEY].subscribe(
			value => {
				let booksList: Array<Book> = value;
                
				for(let book of booksList) {
					//Get the author if not loaded yet
					if(book.author === null) {
						book.author = this.storageService.getElement(AUTHOR_KEY, book.authorId);
					}
					//Get the collection if not loaded yet
					if(book.collection === null && book.collectionId) {
						book.collection = this.storageService.getElement(COLLECTION_KEY, book.collectionId);
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
     * Return the list of books
     */
    getBooks() : Array<Array<Book>> {
        return this.books;
    }

    /**
     * Return the list of filtered books (with filter)
     */
    getFilteredBooks() : Array<Array<Book>> {
        return this.booksWithFilter;
    }

    /**
     * Set the order of the list of books
     * @param sortFields 
     */
    setBooksSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(BOOK_KEY, sortFields);
    }

    /**
	 * Filter books list on some criteria : title, author and collection
	 * @param research 
	 */
    filterBook(research: string) : void {
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
			this.cancelFilterBook();
		}
    }

    cancelFilterBook() {
        this.booksWithFilter = this.books;
    }
}