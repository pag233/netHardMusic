/// <reference types="cypress" />
import RecommendPage from "../POM/recommend_page";

const { apiUrl } = Cypress.env();

context("Login", () => {
  const validAuthInfo = {
    email: "qwe@qwe.com",
    passwd: "qweqweqwe",
    username: "qweqwe",
  };
  const invalidAuthInfo = {
    email: "foo@qwe.com",
    passwd: "foobarbaz",
    username: "foobar",
  };
  describe("happy path login", function () {
    it("login with valid email and password", function () {
      const homePage = new RecommendPage();
      homePage.goto();
      homePage
        .Sidebar()
        .loginPopup()
        .login(validAuthInfo.email, validAuthInfo.passwd);
      cy.contains(validAuthInfo.username);
    });
    it("valid login response should contain JWT token", function () {
      cy.request("POST", apiUrl + "/auth", {
        email: validAuthInfo.email,
        password: validAuthInfo.passwd,
      }).then(function (res) {
        expect(res.headers["x-auth-token"]).to.be.a("string");
      });
    });
  });
  describe("unhappy path login", function () {
    it("login with valid email and invalid password", function () {
      const homePage = new RecommendPage();
      homePage.goto();
      homePage
        .Sidebar()
        .loginPopup()
        .login(validAuthInfo.email, invalidAuthInfo.passwd);
      cy.contains("用户名或密码错误");
    });
    it("login with invalid email and invalid password", function () {
      const homePage = new RecommendPage();
      homePage.goto();
      homePage
        .Sidebar()
        .loginPopup()
        .login(invalidAuthInfo.email, invalidAuthInfo.passwd);
      cy.contains("用户名或密码错误");
    });
  });
});
