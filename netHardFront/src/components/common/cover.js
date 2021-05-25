import React, { useState } from "react";

import Icons from "./icons";
import { BackEnd } from "./utils";
/**
 * @param {String} size - 可选固定Cover大小
 * @param {Boolean} showPlay - 是否显示播放icon
 */
export default function Cover(props) {
  const { item, size, showPlay = true } = props;
  const [showPlayCircle, setShowPlayCircle] = useState(false);
  return (
    <div
      data-testid={props["data-testid"]}
      className="cover"
      onMouseEnter={() => setShowPlayCircle(true)}
      onMouseLeave={() => setShowPlayCircle(false)}
      style={{
        backgroundImage: item.coverUrl
          ? `url(${BackEnd.address}${item.coverUrl})`
          : "",
        width: size + "px",
        height: size + "px",
      }}
    >
      <div className="main-icon-holder">
        {!item.coverUrl && Icons[item.icon]}
      </div>
      <div
        className="play-icon-holder"
        style={{ opacity: showPlay && showPlayCircle ? 0.8 : 0 }}
      >
        {Icons.playFill}
      </div>
    </div>
  );
}
