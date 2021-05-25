import { BaseAction } from "../base_action.js";

export const PlayerSelector = {
  CircleMode: "[data-testid=playmode]",
  TrackDetail: "[data-testid=footer-detail]",
  AudioElem: "[data-testid=audio-player]",
  PlayPrev: "[data-testid=player-prev]",
  PlayNext: "[data-testid=player-next]",
  Play: "[data-testid=player-play]",
  ProgressBarClickArea: "[data-testid=process-bar-click-area]",
  ProgressBar: "[data-testid=bar]",
  VolumeBtn: "[data-testid=volume-btn",
};

export default class Player extends BaseAction {
  getTrackDetail() {
    return cy.get(PlayerSelector.TrackDetail);
  }
  getAudioElem() {
    return cy.get(PlayerSelector.AudioElem);
  }
  playNextTrack() {
    return cy.get(PlayerSelector.PlayNext).click();
  }
  playPrevTrack() {
    return cy.get(PlayerSelector.PlayPrev).click();
  }
  clickPlayIcon() {
    return cy.get(PlayerSelector.Play).click();
  }
  clickProgressBar(position) {
    return cy.get(PlayerSelector.ProgressBarClickArea).click(position);
  }
  getProgressBar() {
    return cy.get(PlayerSelector.ProgressBar);
  }
  clickCircleMode() {
    return cy.get(PlayerSelector.CircleMode).click();
  }
  clickVolumeBtn() {
    return cy.get(PlayerSelector.VolumeBtn).click();
  }
}
