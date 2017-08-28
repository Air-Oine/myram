import { Injectable, EventEmitter } from '@angular/core';

import { StorageService } from './storage.service';

import { Author } from '../model/Author';

export const AUTHOR_KEY = 'author';

@Injectable()
export class AuthorsService {
    private authors: Array<Author> = null;

    private observable: EventEmitter<{}> = null;

    constructor(
        private storageService: StorageService) { 
        
    }

    /**
     * Handle data recuperation in DB for table Author
     */
    require() {
        if(this.authors == null) {
            //Suscribe to authors observable
            this.observable = this.storageService.getListObservable(AUTHOR_KEY);
            this.observable.subscribe(
                value => this.authors = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.setSortFields(['lastName', 'firstName']);
            this.storageService.init(AUTHOR_KEY);
            this.storageService.loadList(AUTHOR_KEY);
        }
    }

    /**
     * Return the list of authors
     */
    getList() : Array<Author> {
        return this.authors;
    }

    /**
     * Add a new author (save in DB)
     * @param author 
     */
    add(author: Author) : Author {
        return this.storageService.addObject(AUTHOR_KEY, author);
    }

    /**
     * Set the order of the list of authors
     * @param sortFields 
     */
    setSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(AUTHOR_KEY, sortFields);
    }
}