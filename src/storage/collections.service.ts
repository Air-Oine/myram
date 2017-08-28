import { Injectable, EventEmitter } from '@angular/core';

import { StorageService } from './storage.service';

import { Collection } from '../model/Collection';

export const COLLECTION_KEY = 'collection';

@Injectable()
export class CollectionsService {
    private collections: Array<Collection> = null;

    private observable: EventEmitter<{}> = null;

    constructor(
        private storageService: StorageService) { 
        
    }

    /**
     * Handle data recuperation in DB for table Collection
     */
    require() {
        if(this.collections == null) {
            this.observable = this.storageService.getListObservable(COLLECTION_KEY);
            this.observable.subscribe(
                value => this.collections = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.setSortFields(['name']);
            this.storageService.init(COLLECTION_KEY);
            this.storageService.loadList(COLLECTION_KEY);
        }
    }

    /**
     * Return the list of collections
     */
    getList() : Array<Collection> {
        return this.collections;
    }

    /**
     * Add a new collection (save in DB)
     * @param collection 
     */
    add(collection: Collection) : Collection {
        return this.storageService.addObject(COLLECTION_KEY, collection);
    }

    /**
     * Set the order of the list of collections
     * @param sortFields 
     */
    setSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(COLLECTION_KEY, sortFields);
    }
}