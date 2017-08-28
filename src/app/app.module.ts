import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { UiTools } from '../ui.tools';
import { StorageService } from '../storage/storage.service';
import { AuthorsService } from '../storage/authors.service';
import { BooksService } from '../storage/books.service';
import { CollectionsService } from '../storage/collections.service';
import { FriendsService } from '../storage/friends.service';
import { LoansService } from '../storage/loans.service';

import { MyApp } from './app.component';
import { ListPage } from '../pages/list/list';
import { AddBookPage } from '../pages/add-book/add-book';
import { LendPage } from '../pages/lend/lend';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    ListPage,
    AddBookPage,
    LendPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListPage,
    AddBookPage,
    LendPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UiTools,
    StorageService,
    AuthorsService,
    CollectionsService,
    BooksService,
    FriendsService,
    LoansService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
