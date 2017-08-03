import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Author } from '../../model/Author';

import { AddBookPage } from '../add-book/add-book';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  BookStatus = BookStatus;

  selectedItem: any;
  items: Array<Book>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    // Mock
    this.items = [];
    const paoliniAuthor = new Author('Paolini', 'Christopher');
    const eragonBook = new Book('Eragon', paoliniAuthor, 'L\'héritage');
    eragonBook.status = BookStatus.Owned;
    eragonBook.read = true;
    this.items.push(eragonBook);

    const platonAuthor = new Author('Platon', '');
    const laRepubliqueBook = new Book('La république', platonAuthor);
    laRepubliqueBook.status = BookStatus.Wanted;
    this.items.push(laRepubliqueBook);
  }

  ngOnInit() {
    //Sort list by collection
    this.items = lodash.sortBy(this.items, 'collection');
  }

  //Go to book creation page
  addItem() {
    this.navCtrl.push(AddBookPage);
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListPage, {
      item: item
    });
  }
}
