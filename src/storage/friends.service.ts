import { Injectable, EventEmitter } from '@angular/core';

import { StorageService } from './storage.service';

import { Friend } from '../model/Friend';

export const FRIEND_KEY = 'friend';

@Injectable()
export class FriendsService {
    private friends: Array<Friend> = null;

    private observable: EventEmitter<{}> = null;

    constructor(
        private storageService: StorageService) { 
        
    }

    //FRIEND

    /**
     * Handle data recuperation in DB for table Friend
     */
    require() {
        if(this.friends == null) {
            this.observable = this.storageService.getListObservable(FRIEND_KEY);
            this.observable.subscribe(
                value => this.friends = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.setSortFields(['lastName', 'firstName']);
            this.storageService.init(FRIEND_KEY);
            this.storageService.loadList(FRIEND_KEY);
        }
    }

    /**
     * Return the friend (asynchronous)
     * @param id 
     */
    get(id: number) {
        return this.storageService.getObject(FRIEND_KEY, id);
    }

    /**
     * Add a new friend (save in DB)
     * @param friend 
     */
    add(friend: Friend) : Friend {
        return this.storageService.addObject(FRIEND_KEY, friend);
    }

    /**
     * Return the list of friends
     */
    getList() : Array<Friend> {
        return this.friends;
    }

    /**
     * Set the order of the list of friends
     * @param sortFields 
     */
    setSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(FRIEND_KEY, sortFields);
    }
}