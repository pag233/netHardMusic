import { BaseAction } from "../base_action.js";
import Message from './message.js';

const headerSelector = {
  message: '[data-testid=message-option]'
};

export default class Header extends BaseAction {
  clickMessageBtn() {
    this.click(headerSelector.message);
    return new Message();
  }
}