import { Injectable } from '@angular/core';

import { Book } from '../model/Book';
import { Author } from '../model/Author';
import { Collection } from '../model/Collection';

const PROXY_URL = 'http://localhost:8080/';
const OPEN_LIBRARY_URL = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
const OPEN_LIBRARY_DATA_MODE = '&jscmd=data';

// 2877649385, 038560792X
@Injectable()
export class ISBNService {

    constructor() { 
        
    }
    
    /**
     * Return an instance of book, fill with data get from Open Library API
     * @param ISBN string, identify a book
     */
    getBookInfo(isbn: number) : Promise<Book> {
        return new Promise(function (resolve, reject) {
            fetch(PROXY_URL + OPEN_LIBRARY_URL + isbn + OPEN_LIBRARY_DATA_MODE)
            .then(value => {
                value.text().then(val => {
                    //Extracting object from JS
                    let stringObject = val.split(isbn + '": ')[1];
                    const book = JSON.parse(stringObject.substr(0, stringObject.length-2));

                    //Authors
                    const authorString = book.authors[0].name;
                    const temp = authorString.split(' ');
                    const lastName = temp[0];
                    let firstName = null;
                    if(temp.length > 1) {
                        firstName = temp[1];
                    }

                    const author = new Author(lastName, firstName);

                    //Title
                    const title = book.title;

                    //Covers
                    const coverSmall = book.cover.small;
                    const coverMedium = book.cover.medium;
                    const coverLarge = book.cover.large;

                    //Collection
                    const collection = new Collection(book.subtitle);

                    //TODO insert author
                    //TODO insert collection

                    let newBook = new Book(
                        title, 
                        author, author.id, 
                        collection, collection.id, 
                        null);
                    newBook.coverLargeUrl = coverLarge;
                    newBook.coverMediumUrl = coverMedium;
                    newBook.coverSmallUrl = coverSmall;

                    resolve(newBook);
                });
            });
        });
    }
}