import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

/**
 * Provide easier access to some UI components
 */
@Injectable()
export class UiTools {

    constructor(private toastCtrl: ToastController) { 
        
    }

    toast(message: string, duration: number = 3000, position: string = 'bottom') {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration,
            position: position
        });

        toast.present();
    }
}