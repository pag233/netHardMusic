export const localStorageRootKey = '/netHardMusic';
export const authInfo = {
  email: "qwe@qwe.com",
  username: "qwe",
  passwd: "qweqweqwe",
};
export class Typeable {
  constructor (selector) {
    this.elemSelector = selector;
  }
  type(input) {
    cy.get(this.elemSelector).click().type(input);
  }
}