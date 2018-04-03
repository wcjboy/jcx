import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { JcxApi, UserSettings } from '../../../shared/shared';

/*
  Generated class for the JcxChat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-chat',
  templateUrl: 'jcx-chat.html'
})
export class JcxChatPage {

  Chat: any = {};
  isOpen: boolean = false;
  message: string = null;

  constructor(public navCtrl: NavController, public userSettings: UserSettings,
    private jcxapi: JcxApi) {

  }

  sendMessage(event) {
    if (this.isOpen && this.message != null && this.message != '' && event.keyCode == 13) {
      this.Chat.socket.send(this.message);
      this.message = null;
    }
  }

  ionViewDidLoad() {
    console.log('Hello JcxChatPage Page');
    this.Chat = {};
    this.Chat.socket = null;
    this.Chat.connect = (host) => {
      if ('WebSocket' in window) {
        this.Chat.socket = new WebSocket(host);
        console.log('WebSocket is supported.');
      } else {
        console.log('Error: WebSocket is not supported by this browser.');
        return;
      }

      this.Chat.socket.onopen = () => {
        console.log('Info: WebSocket connection opened.');
        this.isOpen = true;
      };

      this.Chat.socket.onclose = () => {
        console.log('Info: WebSocket closed.');
        this.isOpen = false;
      };

      this.Chat.socket.onmessage = (message) => {
        console.log(message.data);

        let chatroom = document.getElementById('chatroom');
        let p = document.createElement('p');
        p.style.wordWrap = 'break-word';
        p.innerHTML = message.data;
        chatroom.appendChild(p);
        while (chatroom.childNodes.length > 25) {
          chatroom.removeChild(chatroom.firstChild);
        }
        chatroom.scrollTop = chatroom.scrollHeight;
      };
    };

    this.Chat.initialize = () => {
      let userid = 1;
      if(this.userSettings.user != null) {
        userid = this.userSettings.user.id;
      }
      this.Chat.connect('ws://' + JcxApi.baseUrl.substr('http://'.length) + '/websocket/chat/' + userid);
    };
    this.Chat.initialize();
  }

    /* 	Runs when the page is about to be destroyed and have its elements removed. */
  ionViewWillUnload() {
    console.log('close websocket');
    this.Chat.socket.close();
  }

}
