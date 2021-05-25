import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "./buttons";
import { favTracksSelector, setFavTrack } from "./reduxStore/songlistsSlice";
import { setMenuContext } from "./reduxStore/uiSlice";
import { TrackLineContextMenu } from "./contextMenu";
import { FixedPopup } from "./popup";
import { useHighLight } from "./hooks";
import TrackLine from "./trackline";
import { CreateSonglistMoveableBox } from "./moveableBox";

import Icons from "./icons";
import "./tracksContainer.scss";

const sortIconTypeMap = {
  0: (
    <>
      <span className="up">{Icons.arrowDown}</span>
      <span className="down">{Icons.arrowDown}</span>
    </>
  ),
  1: <span className="down">{Icons.arrowDown}</span>,
  2: <span className="up">{Icons.arrowDown}</span>,
};

function SortIcon({ type = 0 }) {
  return (
    <span className="sort-icon">
      <span className="sort-icon-holder">{sortIconTypeMap[type]}</span>
    </span>
  );
}

function sortTracks(type, field, tracks) {
  let sortTracks = [...tracks];
  switch (type) {
    case 0:
      sortTracks.sort((a, b) => a[field].localeCompare(b[field]));
      break;
    case 1:
      sortTracks.sort((a, b) => -a[field].localeCompare(b[field]));
      break;
    case 2:
      sortTracks.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    default:
      break;
  }
  return sortTracks;
}
const sortTypeCount = 3;
/**
 *
 * @param {number} offset - 分页号，用于重新高亮搜索文字
 */
export default function TracksContainer({
  contextMenuHandle,
  currentTrackId,
  deleteable,
  doubleClickHandle,
  offset,
  searchStr,
  setTracks,
  tracks,
}) {
  const dispatch = useDispatch();
  const [selectedLineIdx, setSelectedLineIdx] = useState();
  const trackLineRef = useRef();
  const favTracks = useSelector(favTracksSelector);
  //搜索过滤
  const searchRegExp = new RegExp(`(.*)(${searchStr})(.*)`, "i");
  //字段排序
  const [sortType, setSortType] = useState({
    name: {
      index: 0,
      show: false,
    },
    artist: {
      index: 0,
      show: false,
    },
    album: {
      index: 0,
      show: false,
    },
    duration: {
      index: 0,
      show: false,
    },
  });
  //高亮
  useHighLight(searchStr, trackLineRef, offset);
  //显示确认取消喜欢窗口
  const [showCancelFav, setShowCancelFav] = useState();
  const [curFavTrack, setCurFavTrack] = useState();
  //contextMenu
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showMoveBox, setShowMoveBox] = useState(false);
  return (
    <ul className="tracks-container">
      <li className="header-line">
        <span className="header-item icon-section"></span>
        <span
          className="header-item title"
          onClick={() => {
            setSortType({
              ...sortType,
              name: {
                index: sortType.name.index + 1,
                show: true,
              },
            });
            setTracks(
              sortTracks(sortType.name.index % sortTypeCount, "name", tracks)
            );
          }}
        >
          音乐标题
          {sortType.name.show && (
            <SortIcon type={sortType.name.index % sortTypeCount} />
          )}
        </span>
        <span
          className="header-item artist"
          onClick={() => {
            setSortType({
              ...sortType,
              artist: {
                index: sortType.artist.index + 1,
                show: true,
              },
            });
            setTracks(
              sortTracks(
                sortType.artist.index % sortTypeCount,
                "artist",
                tracks
              )
            );
          }}
        >
          歌手
          {sortType.artist.show && (
            <SortIcon type={sortType.artist.index % sortTypeCount} />
          )}
        </span>
        <span
          className="header-item album"
          onClick={() => {
            setSortType({
              ...sortType,
              album: {
                index: sortType.album.index + 1,
                show: true,
              },
            });
            setTracks(
              sortTracks(sortType.album.index % sortTypeCount, "album", tracks)
            );
          }}
        >
          专辑
          {sortType.album.show && (
            <SortIcon type={sortType.album.index % sortTypeCount} />
          )}
        </span>
        <span
          className="header-item duration"
          onClick={() => {
            setSortType({
              ...sortType,
              duration: {
                index: sortType.duration.index + 1,
                show: true,
              },
            });
            setTracks(
              sortTracks(
                sortType.duration.index % sortTypeCount,
                "duration",
                tracks
              )
            );
          }}
        >
          时长
          {sortType.duration.show && (
            <SortIcon type={sortType.duration.index % sortTypeCount} />
          )}
        </span>
      </li>
      <ul className="list-line-holder" ref={trackLineRef}>
        {tracks
          ?.filter(
            (track) =>
              track?.name?.search(searchRegExp) > -1 ||
              track?.artist?.search(searchRegExp) > -1 ||
              track?.album?.search(searchRegExp) > -1
          )
          .map((track, key) => (
            <TrackLine
              track={track}
              selected={selectedLineIdx === key}
              className="list-line"
              key={track._id}
              onClick={() => {
                setSelectedLineIdx(key);
              }}
              onDoubleClick={() => {
                doubleClickHandle(track, key);
              }}
              onContextMenu={(e) => {
                dispatch(
                  setMenuContext({
                    position: {
                      top: e.clientY,
                      left: e.clientX,
                    },
                  })
                );
                contextMenuHandle(track);
                setShowContextMenu(true);
              }}
            >
              <span className="list-item icon-section">
                {currentTrackId === track._id ? (
                  <span className="playing">{Icons.playing}</span>
                ) : (
                  <span className="rank">{key + 1}</span>
                )}
                {favTracks.findIndex((t) => t._id === track._id) > -1 ? (
                  <span
                    className="faved"
                    data-testid={"track-disfav-" + key}
                    onClick={() => {
                      if (deleteable === false) {
                        setShowCancelFav(true);
                        return setCurFavTrack(track);
                      }
                      dispatch(
                        setFavTrack({
                          track,
                          faved: false,
                        })
                      );
                    }}
                  >
                    {Icons.favFill}
                  </span>
                ) : (
                  <span
                    data-testid={"track-fav-" + key}
                    className="fav"
                    onClick={() => {
                      dispatch(
                        setFavTrack({
                          track,
                          faved: true,
                        })
                      );
                    }}
                  >
                    {Icons.fav}
                  </span>
                )}
                <span className="download">{Icons.download}</span>
              </span>
              <span
                data-testid={"list-item"}
                className={
                  "list-item high-light-item title" +
                  (currentTrackId === track._id ? " playing" : "")
                }
              >
                {track.name}
              </span>
              <span className="list-item high-light-item artist">
                {track.artist}
              </span>
              <span className="list-item high-light-item album">
                {track.album}
              </span>
              <span className="list-item duration">{track.duration}</span>
            </TrackLine>
          ))}
      </ul>
      {showCancelFav && deleteable === false && (
        <FixedPopup
          className="cancle-fav-popup"
          closePopup={() => {
            setShowCancelFav(false);
          }}
        >
          <div
            className="cancle-fav-close"
            onMouseDown={() => {
              setShowCancelFav(false);
            }}
          >
            {Icons.close}
          </div>
          <div className="warning-text">
            确定将选中歌曲从我喜欢的音乐中删除?
          </div>
          <Button
            className="cancel-fav-confirm"
            type="confirm"
            onClick={() => {
              dispatch(
                setFavTrack({
                  track: curFavTrack,
                  faved: false,
                })
              ).then(() => {
                //我喜欢的音乐将剔除该单曲
                setShowCancelFav(false);
                return setTracks(
                  tracks.filter((t) => t._id !== curFavTrack._id)
                );
              });
            }}
          >
            确定
          </Button>
        </FixedPopup>
      )}
      {showContextMenu && (
        <TrackLineContextMenu
          closeContextMenu={() => setShowContextMenu(false)}
          openMoveBox={() => setShowMoveBox(true)}
        />
      )}
      {showMoveBox && (
        <CreateSonglistMoveableBox
          addTracksAfterCreate={true}
          closeBox={() => setShowMoveBox(false)}
          closeContextMenu={() => setShowContextMenu(false)}
        />
      )}
    </ul>
  );
}
