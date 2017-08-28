import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Friend } from '../../model/Friend';
import { Loan } from '../../model/Loan';

import { BooksService, BOOK_KEY } from '../../storage/books.service';
import { LoansService } from '../../storage/loans.service';
import { FriendsService } from '../../storage/friends.service';

import { UiTools } from '../../ui.tools';

@IonicPage()
@Component({
	selector: 'page-lend',
	templateUrl: 'lend.html',
})
export class LendPage {
    book: Book;

    loan: Loan;
    creation: boolean;

	friendSelected: boolean;
	searchFriendList: Array<Friend> = [];
	
	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
        public booksService: BooksService,
        public loansService: LoansService,
        public friendsService: FriendsService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public uiTools: UiTools) {

        this.loan = new Loan();

        //Get param
        this.book = navParams.get(BOOK_KEY);
        
        //Creation or update
        this.creation = this.book.loanId == null;
	}

    ionViewWillLoad() {
        this.friendsService.require();
        
        this.loansService.require();
    }
    
	ionViewDidLoad() {
        //Update
        if(!this.creation) {
            //Show loading
            let loading = this.loadingCtrl.create({
                content: ''
            });
            loading.present();

            console.log("load");
            //Get Loan
            this.loansService.get(this.book.loanId)
            .then((loan: Loan) => {
                this.loan = loan;
                console.log(loan)

                //Get friend
                return this.friendsService.get(this.loan.friendId);
            })
            .then((friend: Friend) => {
                this.loan.friend = friend;
                this.friendSelected = this.loan.friend ? true : false;

                //Data recuperation done
                loading.dismiss();
            });
        }
	}

	/**
     * Show friends matching research
     * @param event 
     */
    searchFriend(event) {
        this.friendSelected = false;

        let research = event.target.value;

		if (research && research.length > 2) {
			research = research.trim().toLowerCase();

			this.searchFriendList = this.friendsService.getList().filter((item) => {
                return item.firstName.toLowerCase().indexOf(research) > -1 ||
                    item.lastName.toLowerCase().indexOf(research) > -1;
			})
		}
		else {
			this.searchFriendList = [];
		}
    }

    selectExistingFriend(friend: Friend) {
        this.friendSelected = true;

        this.loan.friend = friend;
    }

    /**
     * Show popin for Friend creation
     */
    showAlertAddFriend() {
        let prompt = this.alertCtrl.create({
            title: 'Add friend',
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
                        //Add friend to DB
                        if(!lodash.isEmpty(data.firstName) || !lodash.isEmpty(data.lastName)) {
                            const firstName: string = data.firstName;
                            const lastName: string = data.lastName;
                            const newFriend = new Friend(lastName, firstName);

                            //Saving the friend, and select him
                            this.loan.friend = this.friendsService.add(newFriend);

                            this.friendSelected = true;
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    /**
     * Lend a book, and save it
     */
    save(form) {
        this.loan.friendId = this.loan.friend.id;

        console.log(JSON.stringify(this.loan));

        //Save the loan
        if(this.creation) {
            this.loan = this.loansService.add(this.loan);

            //Update loan ID of the book
            this.book.loanId = this.loan.id;
            this.booksService.update(this.book);

            this.uiTools.toast(this.loan.friend.firstName + ' has borrowed ' + this.book.title);
        }
        else {
            this.loansService.update(this.loan);

            this.uiTools.toast('The loan made to ' + this.loan.friend.firstName + ' has been updated');
        }

        //Close the page
        this.navCtrl.pop();
    }
}
