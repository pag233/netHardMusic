import { BasePage } from "./base_page";
import SonglistDetail from "./componments/songlist_detail";

export const RecommendPageSelector = {
  SonglistCover:
    "[data-testid=songlist-image-cover]",
};

export default class RecommendPage extends BasePage {
  clickFirstSonglist() {
    cy.get(RecommendPageSelector.SonglistCover).first().click();
    // this.click(RecommendPageSelector.FirstSonglist);
    return new SonglistDetail();
  }
  clickSonglistWithName(name) {
    cy.contains(name).scrollIntoView().click();
    return new SonglistDetail();
  }
}
