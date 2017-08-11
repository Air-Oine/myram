import { Component, Injectable, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';
import { Collection } from '../../model/Collection';
import { StorageService, AUTHOR_KEY, BOOK_KEY, COLLECTION_KEY } from '../../storage/storage.service';
import { DataService } from '../../storage/data.service';

@IonicPage()
@Injectable()
@Component({
    selector: 'page-add-book',
    templateUrl: 'add-book.html',
})
export class AddBookPage {
    BookStatus = BookStatus;
    
    book: Book;

    collectionSelected: boolean;
    searchCollectionList: Array<Collection> = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storageService: StorageService,
        public datas: DataService,
        public alertCtrl: AlertController) {

        //Default values
        this.book = new Book();
        this.book.status = BookStatus.None;
        this.book.collection = new Collection('');
        this.collectionSelected = false;
    }

    ionViewWillEnter() {
        //AUTHORS
        this.datas.requireAuthors();

        //COLLECTIONS
        this.datas.requireCollections();
    }

    /**
     * Show collections matching research
     * @param event 
     */
    searchCollection(event) {
        this.collectionSelected = false;

        let research = event.target.value;

		if (research) {
			research = research.trim().toLowerCase();

			this.searchCollectionList = this.datas.getCollections().filter((item) => {
				return item.name.toLowerCase().indexOf(research) > -1;
			})
		}
		else {
			this.searchCollectionList = [];
		}
    }

    selectExistingCollection(collection: Collection) {
        this.collectionSelected = true;

        this.book.collection = collection;
    }

    /**
     * SHow popin for Author creation
     */
    showAlertAddAuthor() {
        let prompt = this.alertCtrl.create({
            title: 'Add author',
            inputs: [
                {
                    name: 'firstName',
                    placeholder: 'First name'
                },
                {
                    name: 'lastName',
                    placeholder: 'Last name'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                },
                {
                    text: 'Save',
                    handler: data => {
                        //Add author to DB
                        if(!lodash.isEmpty(data.firstName) || !lodash.isEmpty(data.lastName)) {
                            const firstName: string = data.firstName;
                            const lastName: string = data.lastName;
                            const newAuthor = new Author(lastName, firstName);

                            //Saving the author, and select him
                            this.book.author = this.storageService.addObject(AUTHOR_KEY, newAuthor);
                            this.book.authorId = this.book.author.id;
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    /**
     * Create a new book, and save it
     */
    save(form) {
        //New collection
        if(!this.collectionSelected) {
            //No user input
            if(this.book.collection.name === '') {
                this.book.collection = null;
            }
            //Save the new collection
            else {
                this.book.collection = this.storageService.addObject(COLLECTION_KEY, this.book.collection);
                this.book.collectionId = this.book.collection.id;
            }
        }
        console.log(JSON.stringify(this.book));
        //Save the book
        this.storageService.addObject(BOOK_KEY, this.book);

        //Close the page
        this.navCtrl.pop();
    }
}
