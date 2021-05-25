import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  trackMetaStateSelector,
  playTrackSingle,
} from "./reduxStore/playlistSlice";
import NavLink from "./reduxStore/historyNavLink";

import Cover from "./cover";
import { SecsToTime } from "./utils";
import TrackLine from "./trackline";
import SonglistLine from "./songlistLine";
import PropTypes from "prop-types";

import Icons from "./icons";
import "./songlist.scss";

/**
 *
 * @param {Array} lists - 歌曲列表
 * @param {String} to - 生成的路径地址
 * @param {Number} maxCount - 列表最大项目数量，其倒数为单个项目宽度比例
 * @param {Number} xRatio - 项目长宽比例
 * @param {Number} yRatio - 项目长宽比例
 * @param {Boolean} withSubtitle - 是否有角标
 */
export function SongListImage({
  className,
  list,
  to = "/songlist/detail/",
  maxCount = 5,
  xRatio = 1,
  yRatio = 1,
  withSubtitle = true,
  testid = false
}) {
  //检查参数是否合法
  [maxCount, xRatio, yRatio].forEach(param => {
    if (param <= 0) throw new RangeError(`${param} needs postive value`);
  });
  //分割列表以小于等于最大项目个数
  if (maxCount) {
    list = list.slice(0, maxCount);
  }
  return (
    <ul className="songlists-image">
      {list.map((item) => {
        return (
          <li
            className="image-item"
            key={item._id}
            style={{
              flexBasis: (1 / Number(maxCount)).toPrecision(2) * 100 + "%",
            }}
            data-testid={testid ? "songlist-image" : undefined}
          >
            <NavLink to={`${to}${item._id}`}>
              <div
                className={"cover-holder" + (className ? " " + className : "")}
                style={{
                  //** hack no.1*/
                  paddingTop: (yRatio / xRatio).toPrecision(2) * 100 + "%",
                }}
              >
                <Cover item={item} data-testid={testid ? "songlist-image-cover" : undefined} />
              </div>
              <div className="item-info">
                <div className="name">{item.name}</div>
              </div>
            </NavLink>
            {withSubtitle && <div className="subtitle">{item.subtitle} </div>}
          </li>
        );
      })}
    </ul>
  );
}
SongListImage.propTypes = {
  list: PropTypes.array.isRequired,
  maxCount: PropTypes.number,
  xRatio: PropTypes.number,
  yRatio: PropTypes.number,
};

export function SongListList({ list, to = "/songlist/detail/" }) {
  return (
    <ul className="songlists-list">
      {list.map((item, key) => {
        return (
          <SonglistLine
            key={key}
            to={`${to}${item._id}`}
            item={item}
            coverSize={60}
          >
            <div className="subtitle sub">{item.subtitle}</div>
            <div className="by sub">
              {item.createdBy && (
                <>
                  <span className="by-text">by</span>
                  <span>{item.createdBy}</span>
                </>
              )}
            </div>
            <div className="favnum sub">
              {item.favnum >= 0 && (
                <>
                  {Icons.folder}
                  <span>{item.favnum}</span>
                </>
              )}
            </div>
            <div className="played sub">
              {item.played >= 0 && (
                <>
                  {Icons.play}
                  <span>{item.played}</span>
                </>
              )}
            </div>
          </SonglistLine>
        );
      })}
    </ul>
  );
}
SongListList.propTypes = {
  list: PropTypes.array.isRequired,
  size: PropTypes.string,
};

export function SongListListImage({ list, to = "/songlist/detail/" }) {
  const { playing, currentTrackId } = useSelector(trackMetaStateSelector);
  const [selectedLineIdx, setSelectedLineIdx] = useState();

  return (
    <ul className="songlists-list-image">
      {list.map((item, key) => {
        const playlist = item.tracks && item.tracks.slice(0, 10);
        return (
          <li className="list-image-item" key={key}>
            <NavLink to={`${to}${item._id}`}>
              <Cover item={item} size={150} showPlay={false} />
            </NavLink>
            <div className="list-holder">
              <span className="name">{item.name}</span>
              {playlist && (
                <ul className="list">
                  {playlist.map((track, key) => (
                    <TrackLine
                      className="item"
                      key={track._id}
                      idx={key}
                      track={track}
                      selected={key === selectedLineIdx}
                      songlist={item}
                      onClick={() => {
                        setSelectedLineIdx(key);
                      }}
                    >
                      <span className="key">
                        {playing && currentTrackId === track._id ? (
                          <span>{Icons.speaker}</span>
                        ) : (
                          <span>{key < 9 ? "0" + (key + 1) : key + 1}</span>
                        )}
                      </span>
                      <span className="heart">
                        {track.faved ? (
                          <span className="fav">{Icons.fav}</span>
                        ) : (
                          <span className="faved">{Icons.favFill}</span>
                        )}
                      </span>
                      <span className="song">{track.name}</span>
                      {<span className="played">{track?.played}</span>}
                      {
                        <span className="time">
                          {SecsToTime(track?.duration)}
                        </span>
                      }
                    </TrackLine>
                  ))}
                  {
                    <li className="item all-tracks">
                      <NavLink to={`${to}${item._id}`}>
                        查看全部{playlist.length}首歌&nbsp;&gt;
                      </NavLink>
                    </li>
                  }
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Title({ title }) {
  return <span className="list-title">{title}</span>;
}

export function UserInfoPlayLists({ list, title }) {
  const [listStyle, setListStyle] = useState("image");
  const listMap = useMemo(
    () => ({
      image: <SongListImage list={list} maxCount={5} />,
      list: <SongListList list={list} />,
      listImage: <SongListListImage list={list} />,
    }),
    [list]
  );
  return (
    <div className="songlists">
      <Title title={title} />
      <span className="list-length"> ({list.length})</span>
      <div className="change-style">
        <div
          className={"toggle-button" + (listStyle === "image" ? " active" : "")}
          onClick={() => {
            setListStyle("image");
          }}
        >
          {Icons.expand}
        </div>
        <div
          className={"toggle-button" + (listStyle === "list" ? " active" : "")}
          onClick={() => {
            setListStyle("list");
          }}
        >
          {Icons.listFlat}
        </div>
        <div
          className={
            "toggle-button" + (listStyle === "listImage" ? " active" : "")
          }
          onClick={() => {
            setListStyle("listImage");
          }}
        >
          {Icons.listThick}
        </div>
      </div>
      {listMap[listStyle]}
    </div>
  );
}
UserInfoPlayLists.propTypes = {
  list: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export function SonglistMultiColumeList({
  list,
  colume = 2,
  height = 80,
  row = 5,
}) {
  const dispatch = useDispatch();
  list = list.slice(0, colume * row);
  return (
    <div
      className="songlists-multi-colume-list"
      style={{
        height: row * height + "px",
      }}
    >
      {list.map((item, key) => (
        <div
          className="multi-colume-item-holder"
          key={item._id}
          style={{
            height: height + "px",
            width: (100 / (100 * colume)).toFixed(2) * 100 + "%",
          }}
        >
          <div
            className={
              "multi-colume-item" +
              ((key + 1) % row === 0 ? " with-border-bottom" : "")
            }
            style={{
              height: height + "px",
            }}
            onDoubleClick={() => {
              dispatch(
                playTrackSingle({
                  track: item,
                })
              );
            }}
          >
            <Cover item={item} size={60}></Cover>
            <div className="key">{key < 9 ? "0" + (key + 1) : key + 1}</div>
            <div className="track-info">
              <div className="title">
                <span className="name">{item.name}</span>
                <span className="subname">{item.subname}</span>
              </div>
              <div className="artist">
                {Icons.quality}
                <span>
                  {item.artist}
                  foobar
                </span>
              </div>
              {item.video && <div className="video-icon"></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
SonglistMultiColumeList.propTypes = {
  list: PropTypes.array.isRequired,
  to: PropTypes.string.isRequired,
  colume: PropTypes.number,
  height: PropTypes.number,
  row: PropTypes.number,
  coverSize: PropTypes.number,
};
