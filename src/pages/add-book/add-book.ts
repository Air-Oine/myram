import { Component, Injectable, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';
import { Collection } from '../../model/Collection';

import { StorageService } from '../../storage/storage.service';
import { DataService, AUTHOR_KEY, BOOK_KEY, COLLECTION_KEY } from '../../storage/data.service';
import { UiTools } from '../../ui.tools';

@IonicPage()
@Injectable()
@Component({
    selector: 'page-add-book',
    templateUrl: 'add-book.html',
})
export class AddBookPage {
    BookStatus = BookStatus;
    
    creation: boolean;
    book: Book;

    collectionSelected: boolean;
    searchCollectionList: Array<Collection> = [];

    authorSelected: boolean;
    searchAuthorList: Array<Author> = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storageService: StorageService,
        public datas: DataService,
        public alertCtrl: AlertController,
        public uiTools: UiTools) {

        let bookToModify = navParams.get(BOOK_KEY);

        //Update
        if(bookToModify) {
            this.creation = false;

            this.book = bookToModify;

            this.authorSelected = this.book.author ? true : false;
            this.collectionSelected = this.book.collection ? true : false;
        }
        else {
            this.creation = true;

            //Default values
            this.book = new Book();
            this.book.status = BookStatus.None;
            this.book.collection = new Collection('');
            this.collectionSelected = false;
        }
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

		if (research && research.length > 2) {
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
     * Show authors matching research
     * @param event 
     */
    searchAuthor(event) {
        this.authorSelected = false;

        let research = event.target.value;

		if (research && research.length > 2) {
			research = research.trim().toLowerCase();

			this.searchAuthorList = this.datas.getAuthors().filter((item) => {
                return item.firstName.toLowerCase().indexOf(research) > -1 ||
                    item.lastName.toLowerCase().indexOf(research) > -1;
			})
		}
		else {
			this.searchAuthorList = [];
		}
    }

    selectExistingAuthor(author: Author) {
        this.authorSelected = true;

        this.book.author = author;
    }

    /**
     * Show popin for Author creation
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

                            this.authorSelected = true;
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    /**
     * Show a confirmation alert before deleting a book
     */
    deleteBookAlert() {
        let confirm = this.alertCtrl.create({
            title: 'Confirm deletion',
            message: this.deleteText(),
            buttons: [
                {
                    text: 'Cancel',
                },
                {
                    text: 'Confirm',
                    handler: () => {
                        this.deleteBook();
                    }
                }
            ]
        });
        confirm.present();
    }

    private deleteText() : string {
        return 'Do you really want to delete ' + this.book.title + ' ?';
    }

    private deleteBook() {
        this.storageService.deleteObject(BOOK_KEY, this.book);

        //Close the page
        this.navCtrl.pop();
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
        else {
            this.book.collectionId = this.book.collection.id;
        }

        //Author ID
        if(this.book.author) {
            this.book.authorId = this.book.author.id;
        }

        console.log(JSON.stringify(this.book));
        //Save the book
        if(this.creation) {
            this.storageService.addObject(BOOK_KEY, this.book);

            this.uiTools.toast(this.book.title + ' has been added');
        }
        else {
            this.storageService.updateObject(BOOK_KEY, this.book);

            this.uiTools.toast(this.book.title + ' has been updated');
        }

        //Close the page
        this.navCtrl.pop();
    }
}
