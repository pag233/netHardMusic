import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearTracksFromLocalStorage,
  clearHistoryTracks,
  hitstoryTracksSelector,
  playTrackSingle,
  resetPlaylist,
  trackMetaStateSelector,
  tracksSelector,
} from '../common/reduxStore/playlistSlice';

import { setMenuContext } from '../common/reduxStore/uiSlice';
import { SideDockerPlayListContextMenu } from '../common/contextMenu';
import { StaticSonglistLine } from '../common/songlistLine';
import { ToggleList } from './togglelist';
import {
  addTrackToSonglist,
  userCreatedSonglistsSelector
} from '../common/reduxStore/songlistsSlice';
import MoveableBox, { CreateSonglistMoveableBox } from '../common/moveableBox';
import NavLink from '../common/reduxStore/historyNavLink';
import TrackLine from '../common/trackline';

import Icons from '../common/icons';
import './playlist.scss';

function PlayListNotFound() {
  return (
    <div className="playlist-not-found">
      您还没有添加任何歌曲!
      <div className="goto">去首页 <NavLink to='/discovery/recommend' className="recommand">发现音乐</NavLink></div>
    </div>
  );
}

function CurrentPlayList() {
  const dispatch = useDispatch();
  const tracks = useSelector(tracksSelector);
  const { trackIdx, playing } = useSelector(trackMetaStateSelector);
  //上下文菜单
  const [showPlayListContextMenu, setShowPlayListContextMenu] = useState(false);
  useEffect(() => () => setShowPlayListContextMenu(false), []);

  //添加歌曲至新建歌单弹窗
  const userCreatedSonglist = useSelector(userCreatedSonglistsSelector);
  const [showCreateSonglistMoveBox, setShowCreateSonglistMoveBox] = useState(false);

  //收藏至歌单弹窗
  const [showCollectAll, setShowCollectAll] = useState(false);
  return (
    <div className="current-play-list">
      <ul className="playlist-container">
        <li className="header">
          <span className="header-col col1">总{tracks.length}首</span>
          <span className="header-col col2 blod"
            onClick={() => {
              setShowCollectAll(true);
            }}
          >{Icons.folder}收藏全部</span>
          <span className="header-col col3 blod"
            onClick={() => {
              dispatch(resetPlaylist());
              dispatch(clearTracksFromLocalStorage());
            }}>{Icons.trash}清空</span>
        </li>
        {
          tracks.length > 0 ? tracks.map((track, key) => (
            <TrackLine track={track} className="row" key={track._id}
              onDoubleClick={() => {
                dispatch(playTrackSingle({
                  track
                }));
              }}
              onContextMenu={(e) => {
                setShowPlayListContextMenu(true);
                dispatch(setMenuContext({
                  position: {
                    top: e.clientY,
                    left: e.clientX,
                  },
                  track,
                }));
              }}
            >
              <span className="icon-holder">
                {
                  trackIdx === key && (
                    playing ? Icons.playing : Icons.pauseLine
                  )
                }
              </span>
              <span className={"row-col col1" + (trackIdx === key ? ' active' : '')}>{track.name}</span>
              <span className={"row-col col2" + (trackIdx === key ? ' active' : '')}>{track.artist}</span>
              <span className="row-col col3">{track.duration}</span>
            </TrackLine>
          )) : <PlayListNotFound />
        }
      </ul>
      {
        showPlayListContextMenu &&
        <SideDockerPlayListContextMenu
          closeContextMenu={() => setShowPlayListContextMenu(false)}
          openMoveBox={() => setShowCreateSonglistMoveBox(true)}
        />
      }
      {
        showCreateSonglistMoveBox &&
        <CreateSonglistMoveableBox
          addTracksAfterCreate={true}
          closeBox={() => setShowCreateSonglistMoveBox(false)}
          closeContextMenu={() => setShowPlayListContextMenu(false)}
        />
      }
      {
        showCollectAll &&
        <MoveableBox closeBox={() => setShowCollectAll(false)}>
          <div className="close-movebox"></div>
          <div className="collect-all">
            <div className="title">收藏到歌单</div>
            <StaticSonglistLine item={{ icon: 'plus', name: '新建歌单' }}
              onClick={() => {
                setShowCreateSonglistMoveBox(true);
                setShowCollectAll(false);
                dispatch(setMenuContext({
                  track: tracks
                }));
              }}
            />
            {
              userCreatedSonglist.map(list => (
                <StaticSonglistLine key={list._id} item={list}
                  onClick={() => {
                    tracks.forEach(track => (
                      dispatch(addTrackToSonglist({ songlist_id: list._id, track }))
                    ));
                    setShowCollectAll(false);
                  }}
                />
              ))
            }
          </div>
        </MoveableBox>
      }
    </div>
  );
}

function HistoryPlayList() {
  const dispatch = useDispatch();
  const tracks = useSelector(hitstoryTracksSelector);
  const { trackIdx, playing } = useSelector(trackMetaStateSelector);

  //上下文菜单
  const [showPlayListContextMenu, setShowPlayListContextMenu] = useState(false);
  useEffect(() => () => setShowPlayListContextMenu(false), []);

  //添加歌曲至新建歌单弹窗
  const [showCreateSonglistMoveBox, setShowCreateSonglistMoveBox] = useState(false);
  return (
    <div className="history-play-list">
      <ul className="playlist-container">
        <li className="header">
          <span className="header-col col1">总{tracks.length}首</span>
          <span className="header-col col2 blod"></span>
          <span className="header-col col3 blod"
            onClick={() => {
              dispatch(clearHistoryTracks());
            }}
          >{Icons.trash}清空</span>
        </li>
        {
          tracks.length > 0 ? tracks.map((track, key) => (
            <TrackLine track={track} className="row" key={track._id}
              onDoubleClick={() => {
                dispatch(playTrackSingle({
                  track
                }));
              }}
              onContextMenu={(e) => {
                setShowPlayListContextMenu(true);
                dispatch(setMenuContext({
                  position: {
                    top: e.clientY,
                    left: e.clientX,
                  },
                  track,
                }));
              }}
            >
              <span className="icon-holder">
                {
                  trackIdx === key && (
                    playing ? Icons.playing : Icons.pauseLine
                  )
                }
              </span>
              <span className={"row-col col1" + (trackIdx === key ? ' active' : '')}>{track.name}</span>
              <span className={"row-col col2" + (trackIdx === key ? ' active' : '')}>{track.artist}</span>
              <span className="row-col col3">{track.duration}</span>
            </TrackLine>
          )) : <PlayListNotFound />
        }
      </ul>
      {
        showPlayListContextMenu &&
        <SideDockerPlayListContextMenu
          closeContextMenu={() => setShowPlayListContextMenu(false)}
          openMoveBox={() => setShowCreateSonglistMoveBox(true)}
        />
      }
      {
        showCreateSonglistMoveBox &&
        <CreateSonglistMoveableBox
          addTracksAfterCreate={true}
          closeBox={() => setShowCreateSonglistMoveBox(false)}
          closeContextMenu={() => setShowPlayListContextMenu(false)}
        />
      }
    </div>
  );
}

export default function PlayList() {
  const [currentList, setCurrentList] = useState('playlist');
  return (
    <div className="play-list-holder">
      <ToggleList width={212} currentList={currentList} setCurrentList={setCurrentList} toggleButtons={[
        {
          target: "playlist",
          text: "播放列表",
        },
        {
          target: "history",
          text: "历史记录",
        }
      ]}>
      </ToggleList>
      {
        currentList === 'playlist' &&
        <CurrentPlayList />
      }
      {
        currentList === 'history' &&
        <HistoryPlayList />
      }
    </div>
  );
}