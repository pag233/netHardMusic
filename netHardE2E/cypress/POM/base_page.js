import { BaseAction } from "./base_action.js";

import SideBar from "./componments/sidebar";
import Footer from "./componments/footer";
import SideDocker from './componments/side_docker';
import Header from "./componments/header.js";
export class BasePage {
  url;
  constructor (url = "/") {
    this.url = url;
    this.action = new BaseAction();
  }
  goto = () => cy.visit(this.url);
  Sidebar = () => new SideBar();
  Footer = () => new Footer();
  SideDocker = () => new SideDocker();
  Header = () => new Header();
  click = (selector, force) => this.action.click(selector, force);
  dblClick = (selector, force) => this.action.dblClick(selector, force);
}
