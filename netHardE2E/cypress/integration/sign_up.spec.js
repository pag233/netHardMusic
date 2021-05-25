/// <reference types="../cypress" />
import RecommendPage from "../POM/recommend_page";
import { authInfo } from '../utils/common';
const { apiUrl } = Cypress.env();

context("User register", function () {
  describe("happy path testing", function () {
    /**
     * stubbing user regiester response
     */
    before(function () {
      cy.intercept("POST", apiUrl + "/user", {
        body: { status: "done" },
      }).as("register");
      const homepage = new RecommendPage();
      homepage.goto();
      cy.wrap({
        loginPopup: homepage.Sidebar().loginPopup(),
      }).as("context");
    });
    it("register with valid auth info", function () {
      const { loginPopup } = this.context;
      const registerPopup = loginPopup.getRegisterPopup();
      registerPopup.register(
        authInfo.email,
        authInfo.username,
        authInfo.passwd
      );
      cy.wait("@register");
      cy.contains("注册成功");
      registerPopup.closeRegisterPopup();
      loginPopup.login(authInfo.email, authInfo.passwd);
      cy.contains(authInfo.username);
    });
  });
});
