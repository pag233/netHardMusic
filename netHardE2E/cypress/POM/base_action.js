export class BaseAction {
  click = (selector, force = false) => cy.get(selector).click({ force });
  dblClick = (selector, force = false) => cy.get(selector).dblclick({ force });
}
