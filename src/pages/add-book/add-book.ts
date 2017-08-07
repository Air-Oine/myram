import { Component, Injectable, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';
import { StorageService, AUTHOR_KEY, BOOK_KEY } from '../../storage/storage.service';

@IonicPage()
@Injectable()
@Component({
    selector: 'page-add-book',
    templateUrl: 'add-book.html',
})
export class AddBookPage {
    book = new Book();
    authors: Array<Author>;
    authorsObservable: EventEmitter<{}>;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storageService: StorageService,
        public alertCtrl: AlertController) {
    }

    ionViewDidLoad() {
        this.initStorage();
    }

    /**
     * Initialize authors list observable, and refresh the list
     */
    private initStorage() {
        this.authorsObservable = this.storageService.getListObservable(AUTHOR_KEY);
        this.authorsObservable.subscribe(
            value => this.authors = value,
            error => console.log(error),
            () => console.log('done')
        );

        this.storageService.loadList(AUTHOR_KEY);
    }

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
        console.log(JSON.stringify(this.book));

        //Save the book
        this.storageService.addObject(BOOK_KEY, this.book);

        //Close the page
        this.navCtrl.pop();
    }
}
