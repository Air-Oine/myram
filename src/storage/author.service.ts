import { Storage } from '@ionic/storage';
import { Injectable, EventEmitter } from '@angular/core';

import { Author } from '../model/Author';

@Injectable()
export class AuthorService {
    private listObservable = new EventEmitter();
    private authorList: Array<Author> = [];

    constructor(private storage: Storage) { }

    mockAuthors() {
        //MOCK
        const paoliniAuthor = new Author('Paolini', 'Christopher');
        const platonAuthor = new Author('Platon', '');

        this.addAuthor(paoliniAuthor);
        this.addAuthor(platonAuthor);
    }

    addAuthor(author: Author) {
        this.storage.set('author' + author.firstName + author.lastName, author);
    }
    
    refreshList() {
        this.authorList = [];

        this.storage.forEach((value, key, iterationNumber) => {
            if(key.includes('author')) {
                this.authorList.push(value);
            }
        }).then(() => {
            this.listObservable.emit(this.authorList);
        });
    }

    getListObservable() {
        return this.listObservable;
    }
}