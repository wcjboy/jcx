import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

declare var window: any;

// https://github.com/phonegap/phonegap-plugin-barcodescanner
// http://ionicframework.com/docs/v2/native/barcode-scanner/
// https://github.com/apache/cordova-plugin-inappbrowser
// http://ionicframework.com/docs/v2/native/inappbrowser/

@Component({
  selector: 'page-jcx-native',
  templateUrl: 'jcx-native.html'
})
export class JcxNativePage {
  results: any;

  constructor(public navCtrl: NavController, private iab: InAppBrowser, private barcodeScanner: BarcodeScanner) { }

  ionViewDidLoad() {
    console.log('Hello JcxNativePage Page');
  }

  /*
        {
          "preferFrontCamera" : true, // iOS and Android
          "showFlipCameraButton" : true, // iOS and Android
          "showTorchButton" : true, // iOS and Android
          "disableAnimations" : true, // iOS
          "prompt" : "Place a barcode inside the scan area", // supported on Android only
          "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
  */

  scan() {
    /*
    let barOptions = {
    };
    */

    this.barcodeScanner.scan().then((barcodeData) => {
      this.results = barcodeData;
    }, (err) => {
      // An error occurred
      alert(`扫描有错：${err}`);
    });
  }

  reset() {
    this.results = null;
  }

  lookup() {
    // alert("lookup");
    // window.open(`http://www.upcindex.com/${this.results.text}`, `_system`);

    let content : string = this.results.text;
    if(content.startsWith('http')) {
      // nothing to change
    }else {
      content = 'http://www.upcindex.com/' + content;
    }

    //let browser = new InAppBrowser(content, '_blank');
    let browser = this.iab.create(content, '_blank');

    // InAppBrowser.open(content, '_blank');
  }

}
