import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

//Components
import { MyApp } from './app.component';
import { IsbnComponent } from '../components/isbn/isbn';

//Pages
import { ListPage } from '../pages/list/list';
import { AddBookPage } from '../pages/add-book/add-book';
import { LendPage } from '../pages/lend/lend';

import { UiTools } from '../ui.tools';
import { StorageService } from '../storage/storage.service';
import { DataService } from '../storage/data.service';
import { ISBNService } from '../storage/isbn.service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    ListPage,
    AddBookPage,
    LendPage,
    IsbnComponent,
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
    DataService,
    ISBNService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
