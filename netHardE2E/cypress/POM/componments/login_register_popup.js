import { BaseAction } from "../base_action.js";

export const LoignPopupSelector = {
  register: "[data-testid=sign-up]",
  emailInputBox: "[data-testid=email]",
  usernameInputBox: "[data-testid=username]",
  passwordInputBox: "[data-testid=password]",
  confirmBtn: "[data-testid=confirm]",
  submitBtn: "[data-testid=submit]",
  loginPopup: "[data-testid=login]",
  closeBtn: "[data-testid=close]",
};

class RegisterPopup extends BaseAction {
  register(email, username, passwd) {
    cy.get(LoignPopupSelector.emailInputBox).type(email);
    cy.get(LoignPopupSelector.usernameInputBox).type(username);
    cy.get(LoignPopupSelector.passwordInputBox).type(passwd);
    cy.get(LoignPopupSelector.confirmBtn).type(passwd);
    cy.get(LoignPopupSelector.submitBtn).click();
  }
  closeRegisterPopup() {
    return this.click(LoignPopupSelector.closeBtn);
  }
}

export default class LoginPopup extends BaseAction {
  login(email, passwd) {
    cy.contains("未登录").click();
    cy.get(LoignPopupSelector.emailInputBox).type(email);
    cy.get(LoignPopupSelector.passwordInputBox).type(passwd);
    return cy.get(LoignPopupSelector.submitBtn).click();
  }
  getRegisterPopup() {
    cy.contains("未登录").click();
    cy.get(LoignPopupSelector.register).click();
    return new RegisterPopup();
  }
  waitForClose() {
    return cy.get(LoignPopupSelector.loginPopup).should('not.exist');
  }
}
