import { Storage } from '@ionic/storage';
import { Injectable, EventEmitter } from '@angular/core';
import * as lodash from 'lodash';

const ID = 'ID';

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
     */
    init(objectName: string) {
        this.getCurrentIdInDB(objectName);
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
        this.storage.set(ID + objectName, this.key[objectName]);

        //Add in list in memory, and send it
        if(this.listLoaded(objectName)) {
            this.lists[objectName].push(item);
            this.refreshList(objectName);
        }

        return item;
    }

    /**
     * Update an object, in DB and memory
     * @param objectName 
     * @param item 
     */
    updateObject(objectName: string, item: any) : any {
        //Update in DB
        this.storage.set(objectName + item.id, item);

        //Update in memory
        if(this.listLoaded(objectName)) {
            var foundIndex = this.lists[objectName].findIndex(x => x.id == item.id);
            this.lists[objectName][foundIndex] = item;

            this.refreshList(objectName);
        }
        return item;
    }

    /**
     * Delete an object, in DB and memory
     * @param objectName 
     * @param id of item to delete
     */
    deleteObjectById(objectName: string, id: number) : void {
        //Delete in DB
        this.storage.remove(objectName + id);

        //Delete in memory
        if(this.listLoaded(objectName)) {
            var foundIndex = this.lists[objectName].findIndex(x => x.id == id);
            this.lists[objectName].splice(foundIndex, 1);

            this.refreshList(objectName);
        }
    }

    /**
     * Delete an object, in DB and memory
     * @param objectName 
     * @param item 
     */
    deleteObject(objectName: string, item: any) : void {
        this.deleteObjectById(objectName, item.id);
    }
    
    /**
     * Load values in DB corresponding to the object name (if the list hasn't loaded yet)
     * @param objectName 
     * @param forceReload : replace memory list by the one in DB
     */
    loadList(objectName: string, forceReload: boolean = false) : void {
        //List hasn't been loaded yet
        if(this.lists[objectName] == undefined || forceReload) {
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
        //Just send signal for refresh
        else {
            this.refreshList(objectName);
        }
    }

    /**
     * Return an item from the list in memory
     * @param objectName 
     * @param id 
     */
    getElement(objectName: string, id: number) {
        //List hasn't been loaded yet
        if(this.lists[objectName] == undefined) {
            let observable = this.getListObservable(objectName);
            observable.subscribe(
                value => {
                    observable.unsuscribe();
                    return lodash.find(value, ['id', id]);
                },
                error => console.log(error),
                () => console.log('done')
            );
        }
        //Already loaded
        else {
            return lodash.find(this.lists[objectName], ['id', id]);
        }
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
     * Return true if the wanted list is loaded in memory
     * @param objectName 
     */
    listLoaded(objectName: string) : boolean {
        return !lodash.isEmpty(this.lists[objectName]);
    }

    /**
     * Send the list (if the list is already in memory, but )
     * @param objectName 
     */
    getList(objectName: string) {
        this.refreshList(objectName);
    }

    /**
     * WARNING : Clear all data stored by the app
     */
    clearStorage() {
        this.storage.clear();
    }

    /**
     * TEST : Mock datas for testing purpose
     */
    /*mockDatas() {
        //2 collections
        let collection = {"name":"L'héritage"};
        const heritage = this.addObject(COLLECTION_KEY, collection);

        collection = {"name":"Label 619"};
        const label619 = this.addObject(COLLECTION_KEY, collection);

        //2 authors
        let author = {"lastName":"Paolini","firstName":"Christopher"};
        const paolini = this.addObject(AUTHOR_KEY, author);

        author = {"lastName":"Bablet","firstName":"Mathieu"};
        const bablet = this.addObject(AUTHOR_KEY, author);

        //2 books
        let book = {
            "title":"Eragon",
            "author":paolini,"authorId":paolini.id,
            "collection":heritage,"collectionId":heritage.id,
            "gender":null,"status":0,"read":null};

        this.addObject(BOOK_KEY, book);

        book = {
            "title":"Shangri-La",
            "author":bablet,"authorId":bablet.id,
            "collection":label619,"collectionId":label619.id,
            "gender":null,"status":0,"read":null};

        this.addObject(BOOK_KEY, book);
    }*/
    
    /**
     * Get increment ID for the object
     * @param objectName 
     */
    private getCurrentIdInDB(objectName: string) {
        //The key is not loaded yet
        if(this.key[objectName] === undefined) {
            this.storage
                .get(ID + objectName)
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