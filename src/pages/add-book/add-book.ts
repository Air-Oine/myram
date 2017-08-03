import { Component, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';
import { AuthorService } from '../../storage/author.service';

@IonicPage()
@Injectable()
@Component({
    selector: 'page-add-book',
    templateUrl: 'add-book.html',
})
export class AddBookPage {
    book = new Book();
    authors: Array<Author>;

    constructor(public navCtrl: NavController, public navParams: NavParams, public authorService: AuthorService) {
    }

    ionViewDidLoad() {
        const listObservable = this.authorService.getListObservable();
        listObservable.subscribe(
            value => this.authors = value,
            error => console.log(error),
            () => console.log('done')
        );
        
        this.authorService.refreshList();
    }

    /**
     * Create a new book, and save it
     */
    save() {
        console.log(JSON.stringify(this.book));
    }
}
