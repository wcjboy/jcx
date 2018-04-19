import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
// import { Storage } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { JcxApp } from './app.component';

import { TabsPage, JcxHomePage, JcxLitePage, JcxTradePage, JcxForumPage, JcxMePage, 
  SbIneedCommentPage, SbSearchShopPage, SbBrowseShopPage, SbRankListPage, 
  JcxHelpPage, JcxAboutPage, JcxContactPage, SafeCssPipe, SafeHtmlPipe,
  ForumShowPage, PostsListPage, TradeForumShowPage, TradePostsListPage,
  JcxChatPage, JcxNativePage, PopoverPage, JcxZbarPage, SbShopDetailsPage
} from '../pages/pages';

import { JcxApi, UserSettings } from '../shared/shared';

@NgModule({
  declarations: [
    JcxApp,
    TabsPage, JcxHomePage, JcxLitePage, JcxTradePage, JcxForumPage, JcxMePage,
    SbIneedCommentPage, SbSearchShopPage, SbBrowseShopPage, SbRankListPage, 
    JcxHelpPage, JcxAboutPage, JcxContactPage, SafeCssPipe, SafeHtmlPipe,
    ForumShowPage, PostsListPage, TradeForumShowPage, TradePostsListPage,
    JcxChatPage, JcxNativePage, PopoverPage, JcxZbarPage, SbShopDetailsPage
  ],
  imports: [
  	BrowserModule,
    HttpModule,
    IonicModule.forRoot(JcxApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    JcxApp,
    TabsPage, JcxHomePage, JcxLitePage, JcxTradePage, JcxForumPage, JcxMePage,
    SbIneedCommentPage, SbSearchShopPage, SbBrowseShopPage, SbRankListPage, 
    JcxHelpPage, JcxAboutPage, JcxContactPage, 
    ForumShowPage, PostsListPage, TradeForumShowPage, TradePostsListPage,
    JcxChatPage, JcxNativePage, PopoverPage, JcxZbarPage, SbShopDetailsPage
  ],
  // providers: [UserSettings, JcxApi, Storage, { provide: ErrorHandler, useClass: IonicErrorHandler }]
  providers: [UserSettings, JcxApi, StatusBar, InAppBrowser, BarcodeScanner, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
