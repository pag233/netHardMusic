import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import {
  getSonglistDetail,
  updateSonglistDetail,
  setTracks,
  postUserFavedSonglist,
  removeUserFavedSonglist,
  songlistDetailSelector,
} from "../../common/reduxStore/songlistsSlice";
import {
  trackMetaStateSelector,
  playTrackSonglist,
} from "../../common/reduxStore/playlistSlice";
import { isLoginSelector } from "../../common/reduxStore/userSlice";
import {
  turnOffShowPlayAllWarning,
  setMenuContext,
  songlistDetailNavTypeSelector,
  setSonglistDetailNavType,
} from "../../common/reduxStore/uiSlice";

import { BackEnd, isOffline } from "../../common/utils";
import { Button } from "../../common/buttons";
import { SonglistComment } from "../../common/comment";
import { fetchData } from "../../common/fetch";
import AddTagsPopup from "./tags";
import Icons from "../../common/icons";
import MoveableBox from "../../common/moveableBox";
import NavLink from "../../common/reduxStore/historyNavLink";
import SearchBar from "../../common/searchBar";
import TracksContainer from "../../common/tracksContainer";
import UserAvatar from "../../common/user/userAvatar";

import "./detail.scss";

function Follower() {
  const { songlist_id } = useParams();
  const [followers, setFollwer] = useState([]);
  useEffect(() => {
    const url = new URL(BackEnd.address + "/songlist/follower");
    url.searchParams.append("songlist_id", songlist_id);
    fetchData(url)
      .then((res) => res.json())
      .then((jsonRes) => {
        setFollwer(jsonRes.follower);
      });
  }, [songlist_id]);
  return (
    <div className="follower-holder">
      {followers.map((follower) => (
        <div key={follower._id} className="follower">
          <UserAvatar
            className="follower-avatar"
            avatar={BackEnd.address + follower.avatarURL}
          />
          <div className="follower-info">
            <div className="name-info">
              <span className="follower-name">{follower.username} </span>
              {follower.info.gender !== "0" && (
                <span className="follower-gender">
                  {follower.info.gender === "1" ? (
                    <span className="male">{Icons.male}</span>
                  ) : (
                    <span className="female">{Icons.female}</span>
                  )}
                </span>
              )}
            </div>
            <span className="follower-description">
              {follower.info.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Detail() {
  const dispatch = useDispatch();
  //??????id
  const { songlist_id } = useParams();
  //?????????
  const [showDetail, setShowDetail] = useState(false);

  //????????????/??????????????????????????????
  const isLogin = useSelector(isLoginSelector);
  const [curIsLogin] = useState(isLogin); //??????????????????????????????
  const songlist = useSelector(songlistDetailSelector);
  const tracks = songlist.tracks;
  const { currentTrackId } = useSelector(trackMetaStateSelector);
  const history = useHistory();

  useEffect(() => {
    dispatch(
      getSonglistDetail({
        songlist_id,
        type: "all",
        isOffline: isOffline(),
      })
    ).then(() => {
      setShowDetail(true);
    });
  }, [dispatch, songlist_id]);

  useEffect(() => {
    if (curIsLogin !== isLogin) {
      history.replace("/", window.history.state);
    }
  }, [curIsLogin, isLogin, history]);

  //?????????????????????
  const [showPlayAllWarning, setShowPlayAllWarning] = useState(false);
  const displayPlayAllWarning = useSelector(
    (state) => state.ui.displayPlayAllWarning
  );
  const playAllCheckBoxRef = useRef();
  //?????????????????????????????????
  const songlistNavType = useSelector(songlistDetailNavTypeSelector);

  //???????????????
  const createdDate = songlist?.createdAt && new Date(songlist.createdAt);
  const date =
    createdDate &&
    createdDate.getFullYear() +
    "-" +
    (createdDate.getMonth() + 1) +
    "-" +
    createdDate.getDate();

  //??????????????????
  const [dropDesc, setDropDesc] = useState(false);

  //??????????????????
  const [searchStr, setSearchStr] = useState("");

  const addTagsAnchorRef = useRef();

  //???????????????
  useEffect(() => {
    return () => setSearchStr("");
  }, [songlist_id]);
  //??????????????????
  const [showAddTags, setShowAddTags] = useState(false);

  return (
    showDetail && (
      <div className="songlist-detail">
        <div className="songlist-summary">
          <div className="songlist-cover">
            {songlist.coverUrl ? (
              <img className="cover-img" src={songlist.coverUrl} alt="" />
            ) : (
              Icons[songlist.icon]
            )}
          </div>
          <div className="songlist-info">
            <div className="songlist-name">
              <div className="name-icon">??????</div>
              <h2 className="name">{songlist.name}</h2>
            </div>
            <div className="user-line">
              <UserAvatar
                className="songlist-detail-avatar"
                avatar={
                  songlist?.created_by?.avatarURL &&
                  BackEnd.address + songlist?.created_by?.avatarURL
                }
              />
              <span className="username blue">{songlist.createdBy}</span>
              {date && <span className="create-at">{date + "??????"}</span>}
            </div>
            <ul className="action-buttons">
              <li className="action-button">
                <button
                  className="play-all"
                  onClick={() => {
                    setShowPlayAllWarning(true);
                    if (!displayPlayAllWarning) {
                      dispatch(
                        playTrackSonglist({
                          currentTrackId: songlist.tracks[0]._id,
                          trackIdx: 0,
                          tracks: songlist.tracks,
                          trackSonglistId: songlist._id,
                        })
                      );
                    }
                  }}
                >
                  {Icons.play}????????????
                </button>
                <button className="add-to-playlist">{Icons.plus}</button>
              </li>
              <li className="action-button">
                {songlist.favable ? (
                  songlist.faved ? (
                    <button
                      className="btn"
                      onClick={() => {
                        dispatch(
                          removeUserFavedSonglist({
                            songlist,
                          })
                        );
                      }}
                    >
                      {Icons.folder}?????????
                      {songlist.favnum && `(${songlist.favnum})`}
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => {
                        dispatch(
                          postUserFavedSonglist({
                            songlist,
                          })
                        );
                      }}
                    >
                      {Icons.folder}??????
                      {songlist.favnum && `(${songlist.favnum})`}
                    </button>
                  )
                ) : (
                  <button
                    className={
                      "btn" + (songlist.favable ? "" : " btn-disabled")
                    }
                    disabled={!songlist.favable}
                  >
                    {Icons.folder}??????
                    {songlist.favnum && `(${songlist.favnum})`}
                  </button>
                )}
              </li>
              <li className="action-button">
                <button className="btn no-implementation">
                  {Icons.share}??????({songlist.shared})
                </button>
              </li>
              <li className="action-button">
                <button className="btn no-implementation">
                  {Icons.download}????????????
                </button>
              </li>
            </ul>
            <div className="songlist-statics">
              {
                <div className="static">
                  {songlist.editable && songlist?.tags?.length === 0 ? (
                    <>
                      <span className="item">???&nbsp;&nbsp;???:</span>
                      <span
                        ref={addTagsAnchorRef}
                        className="add-tag"
                        onMouseDown={() => {
                          setShowAddTags((show) => !show);
                        }}
                      >
                        ????????????
                      </span>
                    </>
                  ) : (
                    songlist?.tags?.length > 0 && (
                      <>
                        <span className="item">???&nbsp;&nbsp;???:</span>
                        <span className="value">
                          {songlist.tags.map((tag, index) => (
                            <span className="tag" key={"tagkey" + index}>
                              {tag +
                                (songlist.tags.length - 1 === index ? "" : "/")}
                            </span>
                          ))}
                        </span>
                      </>
                    )
                  )}
                </div>
              }
              <div className="static">
                <span className="item">?????????:</span>
                <span className="value">{songlist?.tracks?.length}</span>
                <span className="item">?????????:</span>
                <span className="value">{songlist.played}</span>
              </div>
              {songlist?.description ? (
                <div className="description">
                  {dropDesc ? (
                    <pre className="full">
                      ???&nbsp;&nbsp;&nbsp;&nbsp;???:&nbsp;{songlist.description}
                    </pre>
                  ) : (
                    <div className="shorthand">
                      ???&nbsp;&nbsp;&nbsp;&nbsp;???:&nbsp;{songlist.description}
                    </div>
                  )}
                  <div
                    className={
                      dropDesc
                        ? "description-dropdown dropdown-active"
                        : "description-dropdown"
                    }
                    onClick={() => {
                      setDropDesc((state) => !state);
                    }}
                  >
                    {Icons.arrowDown}
                  </div>
                </div>
              ) : (
                songlist.editable && (
                  <NavLink to={`/songlist/editInfo/${songlist_id}`}>
                    <span className="add-description">????????????</span>
                  </NavLink>
                )
              )}
            </div>
          </div>
        </div>
        <div className="songlist-list">
          <nav className="songlist-nav">
            <ul className="nav-list">
              <li
                className={
                  songlistNavType === "songlist"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => {
                  dispatch(setSonglistDetailNavType("songlist"));
                }}
              >
                ????????????
              </li>
              <li
                data-testid="comment-tab"
                className={
                  songlistNavType === "comment" ? "nav-item active" : "nav-item"
                }
                onClick={() => {
                  dispatch(setSonglistDetailNavType("comment"));
                }}
              >
                ??????({songlist.commentLength})
              </li>
              <li
                className={
                  songlistNavType === "follower"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => {
                  dispatch(setSonglistDetailNavType("follower"));
                }}
              >
                ?????????
              </li>
              {songlistNavType === "songlist" && (
                <li className="songlist-search">
                  <SearchBar
                    className="songlist-search-bar"
                    searchStr={searchStr}
                    setSearchStr={setSearchStr}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchStr(value);
                    }}
                  />
                </li>
              )}
            </ul>
          </nav>
          {songlistNavType === "songlist" &&
            (tracks.length > 0 ? (
              <TracksContainer
                contextMenuHandle={(track) => {
                  dispatch(
                    setMenuContext({
                      track,
                      songlist_id: songlist._id,
                      favable: songlist.favable,
                      deleteable: songlist.deleteable,
                    })
                  );
                }}
                currentTrackId={currentTrackId}
                deleteable={songlist.deleteable}
                doubleClickHandle={(track, key) => {
                  dispatch(
                    playTrackSonglist({
                      currentTrackId: track._id,
                      trackIdx: key,
                      tracks,
                      trackSonglistId: songlist._id,
                    })
                  );
                }}
                searchStr={searchStr}
                setTracks={(tracks) => dispatch(setTracks(tracks))}
                tracks={tracks}
              />
            ) : (
              <div className="tracks-empty">
                <h5 className="empty-title">?????????????????????????????????</h5>
                <div className="empty-message">
                  ?????????????????????????????????{" "}
                  <span className="empty-songlist-name">
                    " {songlist.name} "
                  </span>{" "}
                  ??????????????????????????????
                </div>
              </div>
            ))}
          {songlistNavType === "comment" && <SonglistComment />}
          {songlistNavType === "follower" && <Follower />}
        </div>
        {showPlayAllWarning && displayPlayAllWarning && (
          <MoveableBox closeBox={() => setShowPlayAllWarning(false)}>
            <div className="play-all-warning">
              <h4 className="warning-header">??????????????????</h4>
              <div className="warning">
                "????????????"???????????????????????????????????????????????????
              </div>
              <div className="not-again">
                <input
                  type="checkbox"
                  name=""
                  id="not-again"
                  ref={playAllCheckBoxRef}
                />
                &nbsp;
                <label className="checkbox-label" htmlFor="not-again">
                  ????????????
                </label>
              </div>
              <button
                className="confirm"
                onClick={() => {
                  const checkbox = playAllCheckBoxRef.current;
                  if (checkbox.value) {
                    dispatch(turnOffShowPlayAllWarning());
                  }
                  setShowPlayAllWarning(false);
                  dispatch(
                    playTrackSonglist({
                      currentTrackId: songlist.tracks[0]._id,
                      trackIdx: 0,
                      tracks: songlist.tracks,
                      trackSonglistId: songlist._id,
                    })
                  );
                }}
              >
                ??????
              </button>
            </div>
          </MoveableBox>
        )}
        {showAddTags && (
          <AddTagsPopup
            anchorRef={addTagsAnchorRef}
            closePopup={() => {
              setShowAddTags(false);
            }}
            tags={songlist.tags}
            button={({ songlist_id }) => (
              <Button
                className="done"
                type="confirm"
                onClick={() => {
                  const tagNodes = Array.from(
                    document.querySelectorAll(".selected-tag")
                  );
                  if (tagNodes.length !== 0) {
                    const tags = tagNodes.map((node) => node.innerText);
                    return dispatch(
                      updateSonglistDetail({
                        songlist_id,
                        info: {
                          name: songlist.name,
                          tags,
                          description: songlist.description,
                        },
                      })
                    ).then(() => {
                      setShowAddTags(false);
                    });
                  }
                  setShowAddTags(false);
                }}
              >
                ??????
              </Button>
            )}
          />
        )}
      </div>
    )
  );
}
