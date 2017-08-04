import { Component, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';

import { StorageService, AUTHOR_KEY, BOOK_KEY } from '../../storage/storage.service';

import { AddBookPage } from '../add-book/add-book';

@Component({
	selector: 'page-list',
	templateUrl: 'list.html'
})
export class ListPage {
	BookStatus = BookStatus;

	selectedItem: any;
	items: Array<Book>;
	booksObservable: EventEmitter<{}>;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		public storageService: StorageService) {

		// Mock
		/*this.items = [];
		const paoliniAuthor = new Author('Paolini', 'Christopher');
		const eragonBook = new Book('Eragon', paoliniAuthor, 'L\'héritage');
		eragonBook.status = BookStatus.Owned;
		eragonBook.read = true;
		this.items.push(eragonBook);

		const platonAuthor = new Author('Platon', '');
		const laRepubliqueBook = new Book('La république', platonAuthor);
		laRepubliqueBook.status = BookStatus.Wanted;
		this.items.push(laRepubliqueBook);*/
	}

	ionViewDidLoad() {
		this.initStorage();
	}

	/**
	 * Initialize books list observable, and refresh the list
	 */
	private initStorage() {
		this.booksObservable = this.storageService.getListObservable(BOOK_KEY);
		this.booksObservable.subscribe(
			value => {
				this.items = value;
				//Get related table if not defined
				for(let book of this.items) {
					//Get the author if not defined
					if(book.author === null) {
						book.author = this.storageService.getElement(AUTHOR_KEY, book.authorId);
					}
				}
			},
			error => console.log(error),
			() => console.log('done')
		);

		//Sort list by collection
		this.storageService.init(BOOK_KEY, ['collection']);

		this.storageService.loadList(AUTHOR_KEY);
		this.storageService.loadList(BOOK_KEY);
	}

	//Go to book creation page
	addItem() {
		this.navCtrl.push(AddBookPage);
	}
}
