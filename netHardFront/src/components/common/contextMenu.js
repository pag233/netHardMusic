import React, { useRef, useState } from "react";
import propTypes from "prop-types";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";

import { FixedPopup, AnchorPopup } from "./popup";
import {
  getSonglistDetail,
  deleteSonglist,
  deleteTrackFromSonglist,
  userCreatedSonglistsSelector,
  addTrackToSonglist,
} from "./reduxStore/songlistsSlice";
import { contextMenuSelector, setshowLoginPopup } from "./reduxStore/uiSlice";
import { isLoginSelector } from "./reduxStore/userSlice";
import {
  tracksSelector,
  nextTrack,
  playTrackSonglist,
  playTrackSingle,
  removeTrackFromTracks,
} from "./reduxStore/playlistSlice";
import NavLink from "./reduxStore/historyNavLink";

import "./contextMenu.scss";
import Icons from "./icons";

function ContextMenu({ children, className, closeContextMenu }) {
  const menuContext = useSelector(contextMenuSelector);
  return (
    <FixedPopup
      className="menu-context-popup"
      closePopup={closeContextMenu}
      position={menuContext.position}
    >
      <div className={"menu-context" + (className ? " " + className : "")}>
        {children}
      </div>
    </FixedPopup>
  );
}

function SubMenu({ anchorRef, children, className, closeSubMenu }) {
  return (
    <AnchorPopup
      anchorRef={anchorRef}
      closePopup={closeSubMenu}
      alignToAnchor="right"
      topOffset={-16}
    >
      <div className={"context" + (className ? " " + className : "")}>
        {children}
      </div>
    </AnchorPopup>
  );
}

function FavContextItem({ closeContextMenu, openMoveBox }) {
  const dispatch = useDispatch();
  const menuContext = useSelector(contextMenuSelector);
  const userCreatedSonglist = useSelector(userCreatedSonglistsSelector);
  const isLogin = useSelector(isLoginSelector);
  const favAnchorRef = useRef();
  const [showFavSubMenu, setShowFavSubMenu] = useState(false);
  return (
    <span className="context-item">
      <span
        className="submenu-anchor"
        ref={favAnchorRef}
        onMouseEnter={() => {
          setShowFavSubMenu(true);
        }}
        onMouseLeave={() => {
          setShowFavSubMenu(false);
        }}
      >
        <span className="text">??????</span>
        {showFavSubMenu && (
          <SubMenu
            anchorRef={favAnchorRef}
            closeSubMenu={() => setShowFavSubMenu(false)}
          >
            <div className="context">
              <span
                className="sub-context-item"
                onClick={() => {
                  closeContextMenu();
                  if (!isLogin) {
                    return dispatch(setshowLoginPopup(true));
                  }
                  openMoveBox();
                }}
              >
                ???????????????
              </span>
            </div>
            <div className="context">
              {userCreatedSonglist.map((songlist) => (
                <span
                  className="sub-context-item"
                  key={songlist._id}
                  onClick={() => {
                    dispatch(
                      addTrackToSonglist({
                        songlist_id: songlist._id,
                        track: menuContext.track,
                      })
                    );
                    closeContextMenu();
                  }}
                >
                  {songlist.name}
                </span>
              ))}
            </div>
          </SubMenu>
        )}
        {Icons.arrowRight}
      </span>
    </span>
  );
}
FavContextItem.propTypes = {
  closeContextMenu: propTypes.func.isRequired,
  openMoveBox: propTypes.func.isRequired,
};

export function SonglistContextMenu({ className, closeContextMenu }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const menuContext = useSelector(contextMenuSelector);
  const tracks = useSelector(tracksSelector);
  return (
    <ContextMenu className={className} closeContextMenu={closeContextMenu}>
      <div className="context">
        <span
          className="context-item"
          onClick={() => {
            if (tracks.length > 0) {
              dispatch(
                playTrackSonglist({
                  currentTrackId: tracks[0]._id,
                  trackIdx: 0,
                  tracks,
                  trackSonglistId: menuContext.songlist_id,
                })
              );
              return closeContextMenu();
            }
            dispatch(
              getSonglistDetail({
                songlist_id: menuContext.songlist_id,
              })
            )
              .then(unwrapResult)
              .then((res) => {
                const tracks = res.tracks;
                dispatch(
                  playTrackSonglist({
                    currentTrackId: tracks[0]._id,
                    trackIdx: 0,
                    tracks,
                    trackSonglistId: menuContext.songlist_id,
                  })
                );
                closeContextMenu();
              });
          }}
        >
          ??????
        </span>
        <span
          className="context-item"
          onClick={() => {
            closeContextMenu();
            if (tracks.length > 0) {
              return dispatch(nextTrack());
            }
            dispatch(
              getSonglistDetail({
                songlist_id: menuContext.songlist_id,
              })
            )
              .then(unwrapResult)
              .then((songlist) => {
                dispatch(
                  playTrackSonglist({
                    currentTrackId: songlist.tracks[0]._id,
                    trackIdx: 0,
                    tracks: songlist.tracks,
                    trackSonglistId: songlist._id,
                  })
                );
              });
          }}
        >
          ???????????????
        </span>
      </div>
      <div className="context no-implementation">
        <span className="context-item">??????</span>
        <span className="context-item">????????????</span>
        <span className="context-item">????????????</span>
      </div>
      <div className="context">
        <NavLink
          to={`/songlist/editInfo/${menuContext.songlist_id}`}
          onClick={() => closeContextMenu()}
        >
          <span className="context-item">??????????????????</span>
        </NavLink>
        <span
          className="context-item"
          onClick={() => {
            dispatch(
              deleteSonglist({ songlist_id: menuContext.songlist_id })
            ).then(() => {
              history.replace("/", window.history.state);
            });
            closeContextMenu();
          }}
        >
          ????????????
        </span>
      </div>
    </ContextMenu>
  );
}

export function TrackLineContextMenu({
  className,
  closeContextMenu,
  openMoveBox,
}) {
  const dispatch = useDispatch();
  const menuContext = useSelector(contextMenuSelector);
  return (
    <ContextMenu className={className} closeContextMenu={closeContextMenu}>
      <div className="context">
        <span
          className="context-item"
          onClick={() => {
            dispatch(
              playTrackSingle({
                track: menuContext.track,
              })
            );
            closeContextMenu();
          }}
        >
          ??????
        </span>
        <span className="context-item no-implementation">????????????</span>
        <span
          className="context-item"
          onClick={() => {
            dispatch(nextTrack());
            closeContextMenu();
          }}
        >
          ?????????
        </span>
      </div>
      <div className="context">
        <FavContextItem
          closeContextMenu={closeContextMenu}
          openMoveBox={openMoveBox}
        />
        <span className="context-item no-implementation">??????...</span>
        <span className="context-item no-implementation">????????????</span>
        <span className="context-item no-implementation">??????</span>
      </div>
      {
        //????????????????????????????????????????????????
        !menuContext.favable && (
          <div className="context">
            <span
              className="context-item"
              onClick={() => {
                dispatch(
                  deleteTrackFromSonglist({
                    songlist_id: menuContext.songlist_id,
                    track_id: menuContext.track._id,
                    deleteable: menuContext.deleteable,
                  })
                );
                closeContextMenu();
              }}
            >
              ??????????????????
            </span>
          </div>
        )
      }
    </ContextMenu>
  );
}

export function SideDockerPlayListContextMenu({
  className,
  closeContextMenu,
  openMoveBox,
}) {
  const dispatch = useDispatch();
  const menuContext = useSelector(contextMenuSelector);
  return (
    <ContextMenu className={className} closeContextMenu={closeContextMenu}>
      <div className="context">
        <span
          className="context-item"
          onClick={() => {
            dispatch(
              playTrackSingle({
                track: menuContext.track,
              })
            );
            closeContextMenu();
          }}
        >
          ??????
        </span>
        <span className="context-item">????????????</span>
      </div>
      <div className="context no-implementation">
        <span className="context-item">??????</span>
        <span className="context-item">??????</span>
        <span className="context-item">??????</span>
      </div>
      <div className="context">
        <FavContextItem
          closeContextMenu={closeContextMenu}
          openMoveBox={openMoveBox}
        />
        <span className="context-item no-implementation">??????...</span>
        <span className="context-item no-implementation">????????????</span>
        <span className="context-item no-implementation">??????</span>
      </div>
      <div className="context">
        <span
          className="context-item"
          onClick={() => {
            dispatch(
              removeTrackFromTracks({
                track: menuContext.track,
              })
            );
            closeContextMenu();
          }}
        >
          ??????????????????
        </span>
      </div>
    </ContextMenu>
  );
}
