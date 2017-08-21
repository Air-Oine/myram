import { Friend } from '../model/Friend';

export class Loan {
    public id: number = null;

    constructor(
        public friend: Friend = null,
        public friendId: number = null,
        public date: string = new Date().toISOString()) {
    }
}