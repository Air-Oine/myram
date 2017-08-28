import { Storage } from '@ionic/storage';
import { Injectable, EventEmitter } from '@angular/core';

import * as lodash from 'lodash';

const ID = 'ID';

enum DataStatus {NoQuery, Loading, Loaded};

/**
 * Handle storage of objects
 */
@Injectable()
export class StorageService {
    private key: Array<number> = [];
    private listObservable = Array<EventEmitter<any>>();
    private lists: Array<Array<any>> = [];
    private sortFields: Array<Array<string>> = [];
    private listsLoaded: Array<DataStatus> = [];

    constructor(private storage: Storage) { 
        
    }

    /**
     * Initialize the storage service for one table
     * @param tableName name of the table
     */
    init(tableName: string) {
        this.getCurrentIdInDB(tableName);
    }

    /**
     * Store an object, and add it to the list
     * Refresh the list
     * @param tableName 
     * @param item 
     */
    addObject(tableName: string, item: any) : any {
        //Increment the key
        this.key[tableName]++;
        item.id = this.key[tableName];

        //Store the object
        this.storage.set(tableName + this.key[tableName], item);

        //Save the current key
        this.storage.set(ID + tableName, this.key[tableName]);

        //Add in list in memory, and send it
        if(this.listLoaded(tableName)) {
            this.lists[tableName].push(item);
            this.refreshList(tableName);
        }

        return item;
    }

    /**
     * Update an object, in DB and memory
     * @param tableName 
     * @param item 
     */
    updateObject(tableName: string, item: any) : any {
        //Update in DB
        this.storage.set(tableName + item.id, item);

        //Update in memory
        if(this.listLoaded(tableName)) {
            var foundIndex = this.lists[tableName].findIndex(x => x.id == item.id);
            this.lists[tableName][foundIndex] = item;

            this.refreshList(tableName);
        }

        return item;
    }

    /**
     * Delete an object, in DB and memory
     * @param tableName 
     * @param id of item to delete
     */
    deleteObjectById(tableName: string, id: number) : void {
        //Delete in DB
        this.storage.remove(tableName + id);

        //Delete in memory
        if(this.listLoaded(tableName)) {
            var foundIndex = this.lists[tableName].findIndex(x => x.id == id);
            this.lists[tableName].splice(foundIndex, 1);

            this.refreshList(tableName);
        }
    }

    /**
     * Delete an object, in DB and memory
     * @param tableName 
     * @param item 
     */
    deleteObject(tableName: string, item: any) : void {
        this.deleteObjectById(tableName, item.id);
    }
    
    /**
     * Load values in DB corresponding to the table name (if the list hasn't loaded yet)
     * @param tableName 
     * @param forceReload : replace memory list by the one in DB
     */
    loadList(tableName: string, forceReload: boolean = false) : void {
        //List hasn't been loaded yet
        if(this.listNotLoad(tableName) || forceReload) {
            //Init list
            this.listsLoaded[tableName] = DataStatus.Loading;
            this.lists[tableName] = [];

            this.storage.forEach((value, key, iterationNumber) => {
                if(key.startsWith(tableName)) {
                    this.lists[tableName].push(value);
                }
            }).then(() => {
                this.listsLoaded[tableName] = DataStatus.Loaded;
                this.refreshList(tableName);
            });
        }
        //Just send signal for refresh
        else {
            this.refreshList(tableName);
        }
    }

    /**
     * Return an item from the list in memory
     * @param tableName 
     * @param id 
     */
    getObject(tableName: string, id: number) {
        return new Promise(function (resolve, reject) {
            //List currently loading
            if(this.listLoading(tableName)) {
                let observable = this.getListObservable(tableName);
                observable.subscribe(
                    value => {
                        observable.unsuscribe();
                        resolve(lodash.find(value, ['id', id]));
                    },
                    error => reject(),
                    () => console.log('done')
                );
            }
            //List loaded
            else if(this.listLoaded(tableName)) {
                resolve(lodash.find(this.lists[tableName], ['id', id]));
            }
            //Get directly in DB
            else {
                resolve(this.storage.get(tableName + id));
            }
        });
    }

    /**
     * Order of the list of elements
     * @param objectName 
     * @param sortFields 
     */
    setSortFields(tableName: string, sortFields: Array<string> = null) {
        this.sortFields[tableName] = sortFields;
    }

    /**
     * Return observable on the list of elements
     * @param objectName 
     */
    getListObservable(tableName: string) {
        if(this.listObservable[tableName] === undefined) {
            this.listObservable[tableName] = new EventEmitter();
        }
        return this.listObservable[tableName];
    }

    /**
     * Return true if the wanted list is loaded in memory
     * @param objectName 
     */
    listLoaded(objectName: string) : boolean {
        return this.listsLoaded[objectName] === DataStatus.Loaded;
    }

    /**
     * Return true if the wanted list is currently loading in memory
     * @param objectName 
     */
    listLoading(objectName: string) : boolean {
        return this.listsLoaded[objectName] === DataStatus.Loading;
    }

    /**
     * Return true if the wanted list is not load in memory
     * @param objectName 
     */
    listNotLoad(objectName: string) : boolean {
        return this.listsLoaded[objectName] === DataStatus.NoQuery;
    }

    /**
     * Send the list (if the list is already in memory)
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
     * DEVELOPPEMENT
     * Show all databases datas in console
     */
    exportInConsoleData() {
        this.storage.forEach((value, key, iterationNumber) => {
            console.log(key + ': ' + value)
        });
    }
    
    /**
     * Get increment ID for the table
     * @param tableName 
     */
    private getCurrentIdInDB(tableName: string) {
        //The key is not loaded yet
        if(this.key[tableName] === undefined) {
            this.storage
                .get(ID + tableName)
                .then(value => {
                    if(value != null) {
                        this.key[tableName] = value;
                    }
                    //Init key value
                    else {
                        this.key[tableName] = 0;
                    }
                });
        }
    }

    /**
     * Order list and send it to observable
     */
    private refreshList(tableName: string) {
        if(this.sortFields[tableName] !== null && this.lists[tableName].length !== 0) {

            this.lists[tableName] = 
                lodash.sortBy(this.lists[tableName], this.sortFields[tableName]);
        }
        
        //Observable defined -> signal
        if(this.listObservable[tableName] !== undefined) {
            this.listObservable[tableName].emit(this.lists[tableName]);
        }
    }
}