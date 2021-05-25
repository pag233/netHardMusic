import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  sideDockerSelector,
  setSideDocker,
} from "../common/reduxStore/uiSlice";
import {
  addToHistoryTrack,
  firstTrack,
  prevTrack,
  nextTrack,
  setTrackMeta,
  trackMetaStateSelector,
  tracksSelector,
} from "../common/reduxStore/playlistSlice";

import { favTracksSelector } from "../common/reduxStore/songlistsSlice";

import { AnchorPopup } from "../common/popup";
import PorcessBar from "./processBar";
import { BackEnd, SecsToTime, debounce } from "../common/utils";
import Icons from "../common/icons";

import "./footer.scss";

//播放模式
const playModes = [
  {
    text: "单曲循环",
    icon: Icons.loopSingle,
  },
  {
    text: "列表循环",
    icon: Icons.loopList,
  },
  {
    text: "随机播放",
    icon: Icons.loopRandom,
  },
];

const audioCtx = window.webkitAudioContext
  ? new window.webkitAudioContext()
  : new AudioContext();
const gainNode = audioCtx.createGain();
let lastVolume = 0;
function Footer() {
  const dispatch = useDispatch();
  //控制右侧播放列表面板
  const sideDocker = useSelector(sideDockerSelector);
  //播放器
  const playerRef = useRef();
  const volumeBarRef = useRef();
  const playModeAchorRef = useRef();

  const tracks = useSelector(tracksSelector);
  const { trackIdx, playing, currentTrackId } = useSelector(
    trackMetaStateSelector
  );
  const hasTrack = tracks.length !== 0 && trackIdx > -1;
  const newTrack = currentTrackId;
  const [playModePopup, setPlayModePopup] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);

  //音量控制
  const [audioVolume, setAudioVolume] = useState(50);
  const audioVolumeAnchorRef = useRef();
  const [audioVolumePopup, setAudioVolumePopup] = useState(false);

  //当前播放时间
  const [currentTimer, setCurrentTimer] = useState(0);
  const timer = SecsToTime(currentTimer);

  //切换时播放音乐，当歌曲被清除时暂停播放，将播放的音乐添加至历史播放中。
  useEffect(() => {
    const player = playerRef.current;
    if (newTrack) {
      player.play();
      player.currentTime = 0;
      dispatch(addToHistoryTrack({ track: tracks[trackIdx] }));
      dispatch(setTrackMeta({ playing: true }));
    } else {
      player.pause();
    }
  }, [dispatch, newTrack, tracks, trackIdx]);
  //播放，暂停时音量淡入淡出
  useEffect(() => {
    const player = playerRef.current;
    const track = audioCtx.createMediaElementSource(player);
    track.connect(gainNode).connect(audioCtx.destination);
    return () => {
      gainNode.disconnect(audioCtx);
      track.disconnect(gainNode);
    };
  }, []);
  useEffect(() => {
    const player = playerRef.current;
    const duration = 500;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (playing) {
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        1,
        audioCtx.currentTime + duration / 1000
      );
      player.play();
    } else {
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioCtx.currentTime + duration / 1000
      );
      setTimeout(() => {
        player.pause();
      }, duration);
    }
  }, [playing]);
  //调整音量
  useEffect(() => {
    const player = playerRef.current;
    player.volume = (audioVolume * 0.01).toFixed(2);
  }, [audioVolume]);

  //处理播放模式
  const endPlayHandle = useCallback(() => {
    const player = playerRef.current;
    switch (modeIdx) {
      case 0:
        player.play();
        break;
      case 1:
        if (trackIdx < tracks.length - 1) {
          dispatch(nextTrack());
        } else {
          dispatch(firstTrack());
        }
        break;
      case 2:
        const idx = Math.floor(Math.random() * tracks.length);
        dispatch(
          setTrackMeta({
            trackIdx: idx,
            currentTrackId: tracks[idx]._id,
          })
        );
        break;
      default:
        break;
    }
  }, [dispatch, modeIdx, trackIdx, tracks]);

  //是否收藏
  const favTracks = useSelector(favTracksSelector);

  return (
    <div className="footer">
      <PorcessBar
        playerRef={playerRef}
        playing={playing}
        newTrack={newTrack}
        setCurrentTimer={setCurrentTimer}
      />
      <div className="footer-grid-holder">
        <div className="footer-detail" data-testid="footer-detail">
          {hasTrack && (
            <>
              <div
                className="footer-detail-logo"
                style={{
                  backgroundImage: `url(${tracks?.[trackIdx]?.coverUrl &&
                    BackEnd.address + "/" + tracks[trackIdx]?.coverUrl
                    })`,
                }}
              ></div>
              <div className="footer-detail-info">
                <div className="footer-detail-title">
                  <span className="name">{tracks?.[trackIdx]?.name}</span>
                  <span>&nbsp;-&nbsp;</span>
                  <span className="artist">{tracks?.[trackIdx]?.artist}</span>
                </div>
                <div className="footer-detail-timer">
                  {timer} / {tracks?.[trackIdx]?.duration}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="footer-player">
          {favTracks?.findIndex((t) => t._id === currentTrackId) > -1 ? (
            <span className="faved">{Icons.favFill}</span>
          ) : (
            <span className="fav">{Icons.fav}</span>
          )}
          <span
            data-testid="player-prev"
            className="controller"
            onClick={() => {
              dispatch(prevTrack());
            }}
          >
            {Icons.back}
          </span>
          <div
            data-testid="player-play"
            className="play"
            onClick={() => {
              if (hasTrack) {
                dispatch(setTrackMeta({ playing: !playing }));
              }
            }}
          >
            {playing ? Icons.pause : Icons.playFill}
            <div className="play-background"></div>
          </div>
          <span
            data-testid="player-next"
            className="controller"
            onClick={() => {
              dispatch(nextTrack());
            }}
          >
            {Icons.forward}
          </span>
          {Icons.zoomLeft}
        </div>
        <div className="footer-options">
          {/* // 播放模式提示条 */}
          <span
            ref={playModeAchorRef}
            className="option-item"
            onMouseDown={() => {
              modeIdx < playModes.length - 1
                ? setModeIdx(modeIdx + 1)
                : setModeIdx(0);
            }}
            onMouseOver={() => {
              setPlayModePopup(true);
            }}
            onMouseLeave={() => {
              setPlayModePopup(false);
            }}
            data-testid="playmode"
          >
            {playModes[modeIdx].icon}
          </span>
          {playModePopup && (
            <AnchorPopup
              className="play-mode-text"
              anchorRef={playModeAchorRef}
              closePopup={() => {
                setPlayModePopup(false);
              }}
              topOffset={-40}
            >
              {playModes[modeIdx].text}
            </AnchorPopup>
          )}
          <span
            className={
              "option-item" +
              (sideDocker.show && sideDocker.children === "playlist"
                ? " active"
                : "")
            }
            onMouseDown={(e) => {
              e.preventDefault();
              //阻止事件冒泡，防止因不在popup内部单击从而event没有isPopup属性进而导致document捕获事件并将popup关闭
              dispatch(
                setSideDocker({
                  show: !sideDocker.show,
                  children: "playlist",
                })
              );
            }}
          >
            {Icons.playList}
          </span>
          <span className="line option-item no-implementation">词</span>
          <span
            data-testid="volume-btn"
            className="option-item"
            ref={audioVolumeAnchorRef}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!audioVolumePopup) {
                return setAudioVolumePopup(true);
              }
              setAudioVolume((volume) => {
                if (volume > 0) {
                  lastVolume = volume;
                  return 0;
                }
                return lastVolume;
              });
            }}
          >
            {audioVolume > 0 ? Icons.speaker : Icons.speakerOff}
          </span>
          {audioVolumePopup && (
            <AnchorPopup
              anchorRef={audioVolumeAnchorRef}
              topOffset={-126}
              closePopup={() => {
                setAudioVolumePopup(false);
              }}
            >
              {/*音量滑块 */}
              <div className="volume-bar-holder">
                <div
                  className="volume-bar-click-area"
                  onMouseDown={(e) => {
                    const bar = volumeBarRef.current;
                    const barRect = bar.getBoundingClientRect();
                    const barLength = barRect.height;
                    let volume = (
                      (barRect.bottom - e.clientY) /
                      barLength
                    ).toFixed(2);
                    let volumePct = volume * 100;
                    if (volumePct < 0) {
                      volumePct = 0;
                    } else if (volumePct > 100) {
                      volumePct = 100;
                    }
                    setAudioVolume(volumePct);
                  }}
                >
                  <div className="volume-bar-back" ref={volumeBarRef}>
                    <div
                      className="bar"
                      style={{
                        height: audioVolume + "%",
                      }}
                    >
                      <div
                        className="ball"
                        onMouseDown={(e) => {
                          // 阻止document关闭弹窗
                          e.stopPropagation();
                          const bar = volumeBarRef.current;
                          const barRect = bar.getBoundingClientRect();
                          const volumeMouseMoveHandle = (e) => {
                            let volume = barRect.bottom - e.clientY;
                            let barLength = barRect.height;
                            if (volume > barLength) {
                              volume = 75;
                            } else if (volume < 0) {
                              volume = 0;
                            }
                            setAudioVolume(((volume / 75) * 100).toFixed(2));
                          };
                          const deVolumeMouseMoveHandle = debounce(
                            volumeMouseMoveHandle,
                            20
                          );
                          const volumeMouseUpOutHandle = () => {
                            document.removeEventListener(
                              "mousemove",
                              deVolumeMouseMoveHandle
                            );
                            document.removeEventListener(
                              "mouseup",
                              volumeMouseUpOutHandle
                            );
                          };
                          document.addEventListener(
                            "mousemove",
                            deVolumeMouseMoveHandle
                          );
                          document.addEventListener(
                            "mouseup",
                            volumeMouseUpOutHandle
                          );
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </AnchorPopup>
          )}
        </div>
      </div>
      <div className="footer-audio">
        <audio
          data-testid="audio-player"
          ref={playerRef}
          crossOrigin="true"
          src={
            tracks?.[trackIdx] && BackEnd.address + "/" + tracks[trackIdx]?.url
          }
          onEnded={endPlayHandle}
        ></audio>
      </div>
    </div>
  );
}

export default Footer;
