import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LendPage } from './lend';

@NgModule({
  declarations: [
    LendPage,
  ],
  imports: [
    IonicPageModule.forChild(LendPage),
  ],
})
export class LendPageModule {}
