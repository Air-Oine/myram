import { Component } from '@angular/core';

@Component({
  selector: 'isbn',
  templateUrl: 'isbn.html'
})
export class IsbnComponent {

  text: string;

  constructor() {
    console.log('Hello IsbnComponent Component');
    this.text = 'Hello World';
  }

}
