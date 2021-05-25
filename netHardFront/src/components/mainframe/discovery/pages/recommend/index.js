import React, { useEffect, useState } from "react";

import { fetchData } from "../../../../common/fetch";
import { BackEnd } from "../../../../common/utils";
import Banner from "../../../../common/banner";
import Icons from "../../../../common/icons";
import {
  SongListImage,
  SonglistMultiColumeList,
} from "../../../../common/songlist";

import "./recommend.scss";

function SonglistTitle({ children }) {
  return (
    <div className="songlist-title">
      {children}
      {Icons.next}
    </div>
  );
}

export default function Recommend() {
  const [recommandSonglists, setRecommandSonglists] = useState([]);
  const slicedRecommandSonglists = [];
  useEffect(() => {
    const url = new URL(BackEnd.address + "/songlist/recommand");
    url.searchParams.append("limit", 10);
    fetchData(url, "GET")
      .then((res) => res.json())
      .then((jsonRes) => {
        setRecommandSonglists(jsonRes);
      });
  }, []);
  let i = 0;
  const step = 5;
  while (i < recommandSonglists.length - 1) {
    slicedRecommandSonglists.push(recommandSonglists.slice(i, i + step));
    i += step;
    if (i + step > recommandSonglists.length - 1) {
      slicedRecommandSonglists.push(recommandSonglists.slice(i));
      break;
    }
  }

  const [latestSongs, setLatestSongs] = useState([]);
  useEffect(() => {
    fetchData(BackEnd.address + "/song/lastest", "GET")
      .then((res) => res.json())
      .then((jsonRes) => {
        setLatestSongs(jsonRes.latestSongs);
      });
  }, []);

  const [privateContentList, setPrivateContentList] = useState([]);
  useEffect(() => {
    fetchData(BackEnd.address + "/privatecontent", "GET")
      .then((res) => res.json())
      .then((jsonRes) => setPrivateContentList(jsonRes.contents));
  }, []);

  const fakemvlist = [
    {
      _id: 984760431,
      name: "fake mv",
      icon: "music",
    },
    {
      _id: 984760432,
      name: "fake mv",
      icon: "music",
    },
    {
      _id: 984760433,
      name: "fake mv",
      icon: "music",
    },
    {
      _id: 984760434,
      name: "fake mv",
      icon: "music",
    },
  ];

  return (
    <div className="body-container">
      <div className="recommend">
        <Banner />
        <SonglistTitle>推荐歌单</SonglistTitle>
        <div className="songlist-image-holder">
          {slicedRecommandSonglists.map((list, key) => (
            <SongListImage
              key={key}
              list={list}
              maxCount={step}
              withSubtitle={false}
              testid={true}
            />
          ))}
        </div>
        <SonglistTitle>独家放送</SonglistTitle>
        <div className="songlist-image-long-holder">
          <SongListImage
            className="no-implementation"
            list={privateContentList}
            to="/somewhere/else/"
            maxCount={3}
            xRatio={1.8}
            yRatio={1}
            withSubtitle={false}
          />
        </div>
        <SonglistTitle>最新音乐</SonglistTitle>
        <SonglistMultiColumeList list={latestSongs} to="/somewhere/else/" />
        <SonglistTitle>推荐MV</SonglistTitle>
        <div className="songlist-image-long-holder">
          <SongListImage
            className="no-implementation"
            list={fakemvlist}
            to="/somewhere/else/"
            maxCount={4}
            xRatio={1.8}
            yRatio={1}
            withSubtitle={false}
          />
        </div>
      </div>
    </div>
  );
}
