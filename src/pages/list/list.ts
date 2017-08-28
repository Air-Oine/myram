import { Component, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';

import { UiTools } from '../../ui.tools';
import { BooksService, GROUPBY_COLLECTION } from '../../storage/books.service';
import { LoansService } from '../../storage/loans.service';

import { AddBookPage } from '../add-book/add-book';
import { LendPage } from '../lend/lend';

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
		public booksService: BooksService,
		public loansService: LoansService,
		public uiTools: UiTools) {
	}

	ionViewDidLoad() {
		//this.storageService.clearStorage();

		//Notice that we need books, and launch data recuperation
		this.booksService.setSortFields(['collection.name', 'author.lastName', 'volume', 'title']);
		this.booksService.require(GROUPBY_COLLECTION);
	}

	/**
	 * Filter books list on some criteria : title, author and collection
	 * @param event 
	 */
	search(event) {
		let research = event.target.value;

		if(research && research.length > 2) {
			this.booksService.filter(research);
		}
	}

	/**
	 * Cancel research
	 */
	cancelSearch() {
		this.booksService.cancelFilter();
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

	/**
	 * Go to lend page
	 * @param book 
	 */
	lendBook(book: Book) {
		this.navCtrl.push(LendPage, {book});
	}

	/**
	 * Return the borrowed book
	 * @param book 
	 */
	returnBook(book: Book) {
		//Delete loan
		this.loansService.delete(book.loanId);

		//Update reference in book
		book.loanId = null;
		this.booksService.update(book);

		//Show info
		this.uiTools.toast(book.title + ' has been returned');
	}
}
