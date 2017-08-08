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
	itemsFilterable: Array<Book>;
	books: Array<Book>;
	booksObservable: EventEmitter<{}>;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		public storageService: StorageService) {
	}

	ionViewDidLoad() {
		//this.storageService.clearStorage();
		this.initStorage();
	}

	mock() {
		this.storageService.mockDatas();
	}

	/**
	 * Filter books list on some criteria : title, author and collection
	 * @param event 
	 */
	search(event) {
		let research = event.target.value;

		if (research) {
			research = research.trim().toLowerCase();

			this.books = this.itemsFilterable.filter((item) => {
				const titleFound = item.title.toLowerCase().indexOf(research) > -1;
				const collectionFound = item.collection.toLowerCase().indexOf(research) > -1;
				let authorFirstNameFound = false;
				let authorLastNameFound = false;
				if(item.author) {
					authorFirstNameFound = item.author.firstName.toLowerCase().indexOf(research) > -1;
					authorLastNameFound = item.author.lastName.toLowerCase().indexOf(research) > -1;
				}
				return titleFound || collectionFound || authorFirstNameFound || authorLastNameFound;
			})
		}
		else {
			this.books = this.itemsFilterable;
		}
	}

	cancelSearch() {
		this.books = this.itemsFilterable;
	}

	/**
	 * Go to book creation page
	 */
	addItem() {
		this.navCtrl.push(AddBookPage);
	}

	/**
	 * Initialize books list observable, and refresh the list
	 */
	private initStorage() {
		this.booksObservable = this.storageService.getListObservable(BOOK_KEY);
		this.booksObservable.subscribe(
			value => {
				this.itemsFilterable = value;
				//Get related table if not defined
				for(let book of this.itemsFilterable) {
					//Get the author if not defined
					if(book.author === null) {
						book.author = this.storageService.getElement(AUTHOR_KEY, book.authorId);
					}
				}

				//Shawn list
				this.books = this.itemsFilterable;
			},
			error => console.log(error),
			() => console.log('done')
		);

		//Sort list by collection
		this.storageService.init(AUTHOR_KEY, ['lastName', 'firstName']);
		this.storageService.init(BOOK_KEY, ['collection']);

		this.storageService.loadList(AUTHOR_KEY);
		this.storageService.loadList(BOOK_KEY);
	}
}
