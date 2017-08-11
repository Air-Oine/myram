import { Component, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';

import { StorageService, AUTHOR_KEY, BOOK_KEY, COLLECTION_KEY } from '../../storage/storage.service';
import { DataService, GROUPBY_COLLECTION } from '../../storage/data.service';

import { AddBookPage } from '../add-book/add-book';

@Component({
	selector: 'page-list',
	templateUrl: 'list.html'
})
export class ListPage {
	BookStatus = BookStatus;

	selectedItem: any;
	booksFilterable: Array<Book>;

	lastBookCollectionId: number;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		public storageService: StorageService,
		public datas: DataService) {
	}

	ionViewDidLoad() {
		//this.storageService.clearStorage();

		//Notice that we need books, and launch data recuperation
		this.datas.setBooksSortFields(['collection.name', 'author.lastName', 'volume', 'title']);
		this.datas.requireBooks(GROUPBY_COLLECTION);
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

		if(research && research.length > 2) {
			this.datas.filterBook(research);
		}
	}

	/**
	 * Cancel research
	 */
	cancelSearch() {
		this.datas.cancelFilterBook();
	}

	/**
	 * Go to book creation page
	 */
	addItem() {
		this.navCtrl.push(AddBookPage);
	}

	/**
	 * Go to book creation page for modify a book
	 * @param book
	 */
	modifyBook(book: Book) {
		this.navCtrl.push(AddBookPage, {book});
	}
}
