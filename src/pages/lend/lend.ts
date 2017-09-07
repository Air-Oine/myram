import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import * as lodash from 'lodash';

import { Book, BookStatus } from '../../model/Book';
import { Friend } from '../../model/Friend';
import { Loan } from '../../model/Loan';

import { StorageService } from '../../storage/storage.service';
import { FriendsService } from '../../storage/friends.service';
import { DataService, LOAN_KEY, BOOK_KEY, FRIEND_KEY } from '../../storage/data.service';
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
        public datas: DataService,
        public storageService: StorageService,
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
        
        this.datas.requireLoans();
    }
    
	ionViewDidLoad() {
        //Update
        if(!this.creation) {
            //Get values
            //Loan
            if(this.storageService.listLoaded(LOAN_KEY)) {
                this.loan = this.storageService.getElement(LOAN_KEY, this.book.loanId);
            }
            //Wait the list to be loaded
            else {
                //Show loading
                let loading = this.loadingCtrl.create({
                    content: ''
                });
                loading.present();

                const obs = this.storageService.getListObservable(LOAN_KEY);
                obs.subscribe(
                    value => {
                        this.loan = this.storageService.getElement(LOAN_KEY, this.book.loanId);

                        //Friend
                        if(this.storageService.listLoaded(FRIEND_KEY)) {
                            this.loan.friend = this.storageService.getElement(FRIEND_KEY, this.loan.friendId);
                            this.friendSelected = this.loan.friend ? true : false;

                            loading.dismiss();
                        }
                        //Wait the list to be loaded
                        else {
                            const obs = this.storageService.getListObservable(FRIEND_KEY);
                            obs.subscribe(
                                value => {
                                    this.loan.friend = this.storageService.getElement(FRIEND_KEY, this.loan.friendId);
                                    this.friendSelected = this.loan.friend ? true : false;

                                    //Data recuperation done
                                    loading.dismiss();
                                    obs.complete();
                                },
                                error => console.log(error),
                                () => console.log('done')
                            );
                        }
                    },
                    error => console.log(error),
                    () => console.log('done')
                );
            }
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
            this.loan = this.storageService.addObject(LOAN_KEY, this.loan);

            //Update loan ID of the book
            this.book.loanId = this.loan.id;
            this.storageService.updateObject(BOOK_KEY, this.book);

            this.uiTools.toast(this.loan.friend.firstName + ' has borrowed ' + this.book.title);
        }
        else {
            this.storageService.updateObject(LOAN_KEY, this.loan);

            this.uiTools.toast('The loan made to ' + this.loan.friend.firstName + ' has been updated');
        }

        //Close the page
        this.navCtrl.pop();
    }
}
