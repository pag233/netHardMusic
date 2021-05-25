/// <reference types="cypress" />

import RecommendPage from "../POM/recommend_page";

context("with logout state", function () {
  beforeEach(() => {
    const homePage = new RecommendPage();
    homePage.goto();
    const songlistDetail = homePage.clickFirstSonglist();
    const player = homePage.Footer().Player();
    cy.wrap({
      homePage,
      songlistDetail,
      player,
    }).as("context");
  });
  describe("play track", function () {
    it("the track title should show up after double click a new track and audio is playing", function () {
      const { songlistDetail, player } = this.context;
      songlistDetail
        .doubleClickFirstTrack()
        .invoke("text")
        .then((title) => {
          player.getTrackDetail().should("contain.text", title);
          player.getAudioElem().then(($audioElem) => {
            const src = $audioElem.attr("src");
            const paused = $audioElem.prop("paused");
            expect(src).to.not.be.empty;
            expect(paused).to.be.false;
          });
        });
      songlistDetail
        .doubleClickSecondTrack()
        .invoke("text")
        .then((title) => {
          player.getTrackDetail().should("contain.text", title);
        });
    });
    it("can play prev and next track", function () {
      const { songlistDetail, player } = this.context;
      songlistDetail.doubleClickFirstTrack();
      songlistDetail.getPlayingTrackTitle().then(($trackTitle) => {
        const nextLine = $trackTitle.parent().next();
        player.playNextTrack().then(() => {
          const title = nextLine.find(".title");
          expect(title.hasClass("playing")).to.be.true;
        });
        player.playPrevTrack().then(() => {
          expect($trackTitle.hasClass("playing")).to.be.true;
        });
      });
    });
    it("can pause", function () {
      const { songlistDetail, player } = this.context;
      songlistDetail.doubleClickFirstTrack();
      player.clickPlayIcon().then(() => {
        player.getAudioElem().then(($audioElem) => {
          const paused = $audioElem.prop("paused");
          expect(paused).to.be.false;
        });
      });
    });
  });
  describe("loop mode", function () {
    it("single", function () {
      const { songlistDetail, player } = this.context;
      songlistDetail.doubleClickFirstTrack().then(() => {
        songlistDetail.getPlayingTrackTitle().then(($title) => {
          cy.wrap($title.text()).as("title");
        });
      });
      cy.wait(1000).then(() => {
        player.clickProgressBar("right").then(() => {
          cy.wait(1000).then(() => {
            player.getProgressBar().then(() => {
              songlistDetail.getPlayingTrackTitle().then(($title) => {
                expect($title.text()).equal(this.title);
              });
            });
          });
        });
      });
    });
    it("list", function () {
      const { songlistDetail, player } = this.context;
      //switch to list loop mode.
      player.clickCircleMode();
      songlistDetail.doubleClickFirstTrack().then(($trackTitle) => {
        const nextLine = $trackTitle.parent().next();
        cy.wrap($trackTitle.text()).as("firstLineTitle");
        cy.wrap(nextLine.find(".title").text()).as("nextLineTitle");
      });
      //should play next song.
      cy.wait(1000).then(() => {
        player.clickProgressBar("right").then(() => {
          cy.wait(1000).then(() => {
            songlistDetail.getPlayingTrackTitle().then(($trackTitle) => {
              expect($trackTitle.text()).equal(this.nextLineTitle);
            });
          });
        });
      });
      //play last song
      songlistDetail.doubleClickLastTrackTitle().then(() => {
        player.clickProgressBar("right");
        //should play first song
        cy.wait(1000).then(() => {
          songlistDetail.getPlayingTrackTitle().then(($trackTitle) => {
            expect($trackTitle.text()).equal(this.firstLineTitle);
          });
        });
      });
    });
  });
  describe("volume", function () {
    it("can mute", function () {
      const { songlistDetail, player } = this.context;
      songlistDetail.doubleClickFirstTrack();
      player.clickVolumeBtn().then(() => {
        player.clickVolumeBtn();
        player.getAudioElem().then(($elem) => {
          expect($elem.prop("volume")).to.equal(0);
        });
      });
    });
  });
});

context("with login state", function () {
  beforeEach(function () {
    cy.login();
    const homePage = new RecommendPage();
    homePage.goto();
    const songlistDetail = homePage.clickSonglistWithName("摇滚");
    cy.wrap({
      songlistDetail,
    }).as("context");
  });
  describe("favorites songlist", function () {
    before(function () {
      cy.stubFavSonglist();
    });
    it("can favorite a songlist and cancel favorite it", function () {
      const { songlistDetail } = this.context;
      songlistDetail.clickFavorateBtn().then(function () {
        cy.contains("已收藏");
      });
      songlistDetail.clickFavorateBtn().then(function () {
        cy.contains("已收藏").should("not.exist");
      });
    });
  });
  describe("favorite track", function () {
    before(function () {
      cy.stubFavTrack();
    });
    it("can favorite a track and canel favorite it", function () {
      const { songlistDetail } = this.context;
      songlistDetail.clickFirstFavTrackBtn();
      cy.contains("已收藏");
      songlistDetail.clickFirstCancelFavTrackBtn();
      cy.contains("已取消收藏");
    });
  });
  describe("comment", function () {
    const comment = "foobar";
    const replyComment = "barfoo";
    beforeEach(function () {
      const { songlistDetail } = this.context;
      songlistDetail.clickCommentTab();
    });
    it("can commment", function () {
      cy.stubComment(comment);
      const { songlistDetail } = this.context;
      songlistDetail.insertAComment(comment);
      cy.contains(comment);
    });
    it("can reply", function () {
      cy.stubReplyComment(replyComment, comment);
      const { songlistDetail } = this.context;
      songlistDetail.clickFirstCommentReplyBtn();
      songlistDetail.insertAComment(replyComment);
      cy.contains(replyComment);
    });
  });
});
