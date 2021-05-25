/// <reference types="../cypress" />
import RecommendPage from "../POM/recommend_page";

beforeEach(() => {
  cy.login();
  const homePage = new RecommendPage();
  homePage.goto();
  const header = homePage.Header();
  cy.wrap({
    header
  }).as('context');
});

it('能够正常回复私信', function () {
  cy.stubPrivateMessage();
  const { header } = this.context;
  const message = header.clickMessageBtn();
  const privateMessage = message.switchMessageType('private');
  const privateMsgSession = privateMessage.clickFirstPrivateMessageSession();
  const msgText = 'fake message{enter}';
  privateMsgSession.sendMessage(msgText);
  cy.contains(msgText).then($elem => {
    expect($elem.hasClass("message-pop")).to.be.true;
  });
});

it("'空消息无法发出", function () {
  cy.stubPrivateMessage();
  const { header } = this.context;
  const message = header.clickMessageBtn();
  const privateMessage = message.switchMessageType('private');
  const privateMsgSession = privateMessage.clickFirstPrivateMessageSession();
  privateMsgSession.sendMessage("   " + "{enter}");
  cy.get('.message-pop').should("have.length", 1);
});

it.only('私信字数个数应小于等于限制值', function () {
  cy.stubPrivateMessage();

  const { header } = this.context;
  const message = header.clickMessageBtn();
  const privateMessage = message.switchMessageType('private');
  const privateMsgSession = privateMessage.clickFirstPrivateMessageSession();

  const character_limit = 200;
  const text = "!";
  const msgText = text.repeat(210);
  privateMsgSession.sendMessage(msgText + "{enter}");
  cy.contains(text).then($elem => {
    expect($elem.text().length).to.equal(character_limit);
  });
});

it('空私信列表应显示暂无私信', function () {
  cy.stubPrivateMessage(0);
  const { header } = this.context;
  header.clickMessageBtn();
  cy.contains('暂无私信');
});