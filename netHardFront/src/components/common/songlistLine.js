import React, { useRef } from "react";

import NavLink from "./reduxStore/historyNavLink";
import Cover from "./cover";
import "./songlistLine.scss";
import { useHighLight } from "./hooks";

export function StaticSonglistLine({ children, item, onClick }) {
  return (
    <li className="songlist-line-item-static" onClick={(e) => onClick(e)}>
      <Cover item={item} size={60} showPlay={false} />
      <div className="item-info">
        <div className="name">{item.name}</div>
        {item.tracks && <div className="total">{item.tracks.length}首音乐</div>}
      </div>
      {children}
    </li>
  );
}

export default function SonglistLine({
  children,
  coverSize = 60,
  item,
  offset,
  query,
  to,
}) {
  const ref = useRef();
  useHighLight(query, ref, offset);
  return (
    <li className="songlist-line-item" ref={ref}>
      <NavLink to={to}>
        <Cover item={item} size={coverSize} />
      </NavLink>
      <NavLink className="name high-light-item" to={to}>
        {item.name}
      </NavLink>
      {children}
    </li>
  );
}
