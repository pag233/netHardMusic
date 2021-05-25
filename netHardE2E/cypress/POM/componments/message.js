import { BaseAction } from "../base_action.js";

import { Typeable } from '../../utils/common';

const MessageSelector = {
  privateMessageBtn: "私信",
  commentBtn: "评论",
  atBtn: "@我",
};


export class AtMessage {

}

export class CommentMessage {

}

const PrivateMessageSelector = {
  privateMessageSession: '[data-testid=message-text]'
};

export class PrivateMessage {
  clickFirstPrivateMessageSession() {
    cy.get(PrivateMessageSelector.privateMessageSession).first().click();
    return new PrivateMessageSession();
  }
}
const PrivateMessageSessionSelector = {
  InputBox: "[data-testid=private-session-text-box]"
};


export class PrivateMessageSession {
  constructor () {
    this.inputBox = new Typeable(PrivateMessageSessionSelector.InputBox);
  }
  sendMessage(message) {
    this.inputBox.type(message);
  }
}
export default class Message {
  constructor () {
    this.__private = new PrivateMessage();
    this.__comment = new AtMessage();
    this.__at = new AtMessage();
  }
  switchMessageType(type) {
    switch (type) {
      case 'private':
        cy.contains(MessageSelector.privateMessageBtn).click();
        return this.__private;
      case 'comment':
        cy.contains(MessageSelector.commentBtn).click();
        return this.__comment;
      case 'at':
        cy.contains(MessageSelector.atBtn).click();
        return this.__comment;
      default:
        throw new TypeError('the type of message componment is not support: ' + type);
    }
  }
}