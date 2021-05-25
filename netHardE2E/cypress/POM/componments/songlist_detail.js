import { BaseAction } from "../base_action.js";

export const SonglistDetailSelector = {
  Tracks: "[data-testid=list-item]",
  PlayingTrackTitle: ".list-item.playing.title",
  FavSonglistBtn: "收藏",
  FirstFavTrackBtn: "[data-testid=track-fav-0]",
  FirstCancelFavTrackBtn: "[data-testid=track-disfav-0]",
  FirstCommentReplyBtn: "[data-testid=comment-reply-0]",
  CommentTab: "[data-testid=comment-tab]",
  CommentInput: "[data-testid=static-textarea]",
};

export default class SonglistDetail extends BaseAction {
  doubleClickFirstTrack() {
    return cy.get(SonglistDetailSelector.Tracks).first().dblclick();
  }
  doubleClickSecondTrack() {
    return cy.get(SonglistDetailSelector.Tracks).first().next().dblclick();
  }
  doubleClickLastTrackTitle() {
    return cy
      .get(SonglistDetailSelector.Tracks).last()
      .scrollIntoView()
      .dblclick();
  }
  getPlayingTrackTitle() {
    return this.click(SonglistDetailSelector.PlayingTrackTitle);
  }
  clickFavorateBtn() {
    return cy.get('button').contains(SonglistDetailSelector.FavSonglistBtn).click();
  }
  clickFirstFavTrackBtn() {
    return this.click(SonglistDetailSelector.FirstFavTrackBtn, true);
  }
  clickFirstCancelFavTrackBtn() {
    return this.click(SonglistDetailSelector.FirstCancelFavTrackBtn, true);
  }
  clickCommentTab() {
    return this.click(SonglistDetailSelector.CommentTab);
  }
  clickFirstCommentReplyBtn() {
    return this.click(SonglistDetailSelector.FirstCommentReplyBtn);
  }
  insertAComment(comment) {
    return cy
      .get(SonglistDetailSelector.CommentInput)
      .click()
      .type(comment)
      .type("{enter}");
  }
}
