import { Injectable, EventEmitter } from '@angular/core';

import { StorageService } from './storage.service';

import { Loan } from '../model/Loan';

export const LOAN_KEY = 'loan';

@Injectable()
export class LoansService {
    private loans: Array<Loan> = null;

    private observable: EventEmitter<{}> = null;

    constructor(
        private storageService: StorageService) { 
        
    }

    /**
     * Handle data recuperation in DB for table Loan
     */
    require() {
        if(this.loans == null) {
            this.observable = this.storageService.getListObservable(LOAN_KEY);
            this.observable.subscribe(
                value => this.loans = value,
                error => console.log(error),
                () => console.log('done')
            );

            this.setSortFields(['date']);
            this.storageService.init(LOAN_KEY);
            this.storageService.loadList(LOAN_KEY);
        }
    }

    /**
     * Return the list of loans
     */
    getList() : Array<Loan> {
        return this.loans;
    }

    /**
     * Return the loan (asynchronous)
     * @param id 
     */
    get(id: number) {
        return this.storageService.getObject(LOAN_KEY, id);
    }

    /**
     * Add a new loan (save in DB)
     * @param loan 
     */
    add(loan: Loan) : Loan {
        return this.storageService.addObject(LOAN_KEY, loan);
    }

    /**
     * Update a loan
     * @param loan 
     */
    update(loan:Loan) {
        this.storageService.updateObject(LOAN_KEY, loan);
    }

    /**
     * Delete a loan
     * @param id 
     */
    delete(id: number) {
        this.storageService.deleteObjectById(LOAN_KEY, id);
    }

    /**
     * Set the order of the list of loans
     * @param sortFields 
     */
    setSortFields(sortFields: Array<string> = null) {
        this.storageService.setSortFields(LOAN_KEY, sortFields);
    }
}