import { Storage } from '@ionic/storage';
import { Injectable, EventEmitter } from '@angular/core';
import * as lodash from 'lodash';

const ID = 'ID';

export const AUTHOR_KEY = 'author';
export const BOOK_KEY = 'book';

/**
 * Handle storage of objects
 */
@Injectable()
export class StorageService {
    private key: Array<number> = [];
    private listObservable = Array<EventEmitter<any>>();
    private lists: Array<Array<any>> = [];
    private sortFields: Array<Array<string>> = [];

    constructor(private storage: Storage) { 
        
    }

    /**
     * Initialize the storage service for one table
     * @param objectName name of the table
     * @param sortFields if you want a list of table elements
     */
    init(objectName: string, sortFields: Array<string> = null) {
        this.getCurrentIdInDB(objectName);
        this.setSortFields(objectName, sortFields);
    }

    /**
     * Store an object, and add it to the list
     * Refresh the list
     * @param objectName 
     * @param item 
     */
    addObject(objectName: string, item: any) : any {
        //Store in DB
        this.key[objectName]++;
        item.id = this.key[objectName];
        this.storage.set(objectName + this.key[objectName], item);

        //Save the current key
        this.storage.set(objectName + ID, this.key[objectName]);

        //Add in list in memory, and send it
        this.lists[objectName].push(item);
        this.refreshList(objectName);

        return item;
    }
    
    /**
     * Load values in DB corresponding to the object name (if the list hasn't loaded yet)
     * @param objectName 
     */
    loadList(objectName: string) {
        if(this.lists[objectName] === undefined) {
            //Init list
            this.lists[objectName] = [];

            this.storage.forEach((value, key, iterationNumber) => {
                if(key.startsWith(objectName)) {
                    this.lists[objectName].push(value);
                }
            }).then(() => {
                this.refreshList(objectName);
            });
        }
    }

    /**
     * Return an item from the list in memory
     * @param objectName 
     * @param id 
     */
    getElement(objectName: string, id: number) {
        return lodash.find(this.lists[objectName], ['id', id]);
    }

    /**
     * Order of the list of elements
     * @param objectName 
     * @param sortFields 
     */
    setSortFields(objectName: string, sortFields: Array<string> = null) {
        this.sortFields[objectName] = sortFields;
    }

    /**
     * Return observable on the list of elements
     * @param objectName 
     */
    getListObservable(objectName: string) {
        if(this.listObservable[objectName] === undefined) {
            this.listObservable[objectName] = new EventEmitter();
        }
        return this.listObservable[objectName];
    } 

    /**
     * WARNING : Clear all data stored by the app
     */
    clearStorage() {
        this.storage.clear();
    }
    
    /**
     * Get increment ID for the object
     * @param objectName 
     */
    private getCurrentIdInDB(objectName: string) {
        //The key is not loaded yet
        if(this.key[objectName] === undefined) {
            this.storage
                .get(objectName + ID)
                .then(value => {
                    if(value != null) {
                        this.key[objectName] = value;
                    }
                    //Init key value
                    else {
                        this.key[objectName] = 0;
                    }
                });
        }
    }

    /**
     * Order list and send it to observable
     */
    private refreshList(objectName: string) {
        if(this.sortFields[objectName] !== null && this.lists[objectName].length !== 0) {

            this.lists[objectName] = 
                lodash.sortBy(this.lists[objectName], this.sortFields[objectName]);
        }
        
        //Observable defined -> signal
        if(this.listObservable[objectName] !== undefined) {
            this.listObservable[objectName].emit(this.lists[objectName]);
        }
    }
}