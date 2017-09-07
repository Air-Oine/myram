import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ISBNService } from '../../storage/isbn.service';

import { Book } from '../../model/Book';

@Component({
selector: 'isbn-search',
templateUrl: 'isbn.html'
})
export class IsbnComponent {

	@Input() isbn: number;
	@Output() bookLoaded = new EventEmitter<Book>();

	searchInProgress: boolean = false;

	constructor(
		public isbnService: ISBNService,
	) {

	}

	/**
	 * Check form validity
	 */
	formIsValid() {
		//ISBN
		if(this.isbn) {
			//Is valid if at least 10 digits long 
			return String(this.isbn).length > 9;
		}
		return false;
	}

	getIsbnInfo() {
		this.searchInProgress = true;

		this.isbnService.getBookInfo(this.isbn).then(value => {
			console.log(value);
			this.searchInProgress = false;
			this.bookLoaded.emit(value);
		})
	}
}
