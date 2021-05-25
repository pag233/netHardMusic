import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route, useParams } from "react-router";
import { unwrapResult } from "@reduxjs/toolkit";

import { BackEnd } from "../../../common/utils";
import {
  playTrackSingle,
  trackMetaStateSelector,
} from "../../../common/reduxStore/playlistSlice";
import {
  search,
  searchStrSelector,
  setSearchStr,
} from "../../../common/reduxStore/searchSlice";
import { setMenuContext } from "../../../common/reduxStore/uiSlice";
import { useHighLight } from "../../../common/hooks";
import NavLink from "../../../common/reduxStore/historyNavLink";
import PageNav from "../../../common/pageNav";
import SonglistLine from "../../../common/songlistLine";
import TracksContainer from "../../../common/tracksContainer";
import UserAvatar from "../../../common/user/userAvatar";

import "./search.scss";

const limit = 10;

function Song({ currentTrackId, offset, searchStr, setTracks, tracks }) {
  const dispatch = useDispatch();
  return (
    <div className="search-single-song">
      <TracksContainer
        contextMenuHandle={(track) => {
          dispatch(
            setMenuContext({
              track,
              favable: true,
            })
          );
        }}
        currentTrackId={currentTrackId}
        doubleClickHandle={(track) => {
          dispatch(
            playTrackSingle({
              track,
            })
          );
        }}
        offset={offset}
        searchStr={searchStr}
        setTracks={setTracks}
        tracks={tracks}
      />
    </div>
  );
}

function Songlist({ offset, query, tracks }) {
  return (
    <div className="search-songlist">
      <ul className="songlist-line-container">
        {tracks.map((track) => (
          <SonglistLine
            key={track._id}
            query={query}
            item={track}
            to={"/songlist/detail/" + track._id}
            coverSize="60px"
            offset={offset}
          >
            <span className="size">{track.size + "首歌"}</span>
            <span className="by">by&nbsp;{track?.created_by?.username}</span>
          </SonglistLine>
        ))}
      </ul>
    </div>
  );
}

function Username({ offset, query, tracks }) {
  const usernameRef = useRef();
  useHighLight(query, usernameRef, offset);
  return (
    <div className="user-search-result">
      <ul className="users-container" ref={usernameRef}>
        {tracks.map((track) => (
          <NavLink to={`/user/info/detail/${track.username}`} key={track._id}>
            <li className="user-line">
              <UserAvatar
                className="user-line-avatar"
                avatar={track.avatarURL && BackEnd.address + track.avatarURL}
              />
              <div className="username high-light-item">{track.username}</div>
              <div className="description">{track.description}</div>
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
}

export default function Result() {
  const dispatch = useDispatch();
  //搜索文字
  const { query, path: curPath } = useParams();
  //匹配总数
  const [matched, setMatched] = useState(0);
  //搜索偏移
  const [offset, setOffset] = useState(0);
  //结果列表
  const [tracks, setTracks] = useState([]);
  //搜索文字
  const searchStr = useSelector(searchStrSelector);
  //播放单曲id
  const { currentTrackId } = useSelector(trackMetaStateSelector);

  useEffect(() => {
    let mounted = true;
    dispatch(
      search({
        limit,
        query,
        skip: offset * limit,
        type: curPath,
      })
    )
      .then(unwrapResult)
      .then((res) => {
        if (mounted) {
          setMatched(res.total);
          dispatch(setSearchStr(query));
          setTracks(res.tracks);
        }
      });
    return () => (mounted = false);
  }, [query, offset, curPath, dispatch]);

  const searchType = [
    {
      type: "单曲",
      path: "song",
      component: (
        <Song
          currentTrackId={currentTrackId}
          offset={offset}
          searchStr={searchStr}
          setTracks={setTracks}
          tracks={tracks}
        />
      ),
    },
    {
      type: "歌单",
      path: "songlist",
      component: (
        <Songlist offset={offset} searchStr={searchStr} tracks={tracks} />
      ),
    },
    {
      type: "用户",
      path: "username",
      component: (
        <Username offset={offset} searchStr={searchStr} tracks={tracks} />
      ),
    },
  ];

  return (
    <div className="search">
      <div className="search-fix-box">
        <div className="search-type">
          <span className="query">{query}</span>
          <span className="total">
            已找到<span className="number">{matched}</span>个结果
          </span>
        </div>
        <ul className="search-type-nav">
          {searchType.map(({ type, path }, key) => (
            <NavLink
              to={`/search/result/${path}/${query}`}
              key={"search-type" + key}
              onClick={() => curPath !== path && setTracks([])}
            >
              <li className="type">{type}</li>
            </NavLink>
          ))}
        </ul>
      </div>
      <Switch>
        {searchType.map(({ type, path, component }, key) => (
          <Route
            key={key}
            exact={true}
            path={`/search/result/${path}/:query`}
            children={
              matched > 0 ? (
                component
              ) : (
                <div className="not-found">
                  很抱歉，未能找到与“<span className="query">{query}</span>
                  ”相关的任何{type}。
                </div>
              )
            }
          />
        ))}
      </Switch>
      {matched > 0 && (
        <PageNav
          total={matched}
          offset={offset}
          setOffset={setOffset}
          limit={10}
        />
      )}
    </div>
  );
}
