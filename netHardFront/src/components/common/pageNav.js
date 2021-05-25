import React from "react";

import Icons from "./icons";
import "./pageNav.scss";

/**
 * @param {Number} limit - 查询结果最大数
 * @param {Number} offset - 查询偏移量
 * @param {Function} setOffset - 设置查询偏移
 * @param {Number} total - 结果总数
 */
export default function PageNav({ limit, offset, setOffset, total }) {
  const count = Math.ceil(total / limit);
  const first = offset <= 0;
  const last = offset >= count - 1;
  const pagesNum = [];
  let i = 1;
  while (i < count + 1) {
    pagesNum.push(i);
    i++;
  }
  return (
    <ul className="page-nav">
      <li
        className={"page prev" + (first ? " disabled" : "")}
        onClick={() => {
          !first && setOffset((offset) => offset - 1);
        }}
      >
        {Icons.next}
      </li>
      {pagesNum.map((num, key) => (
        <li
          className={"page" + (offset === key ? " page-active" : "")}
          key={key}
          onClick={() => {
            setOffset(key);
          }}
        >
          {num}
        </li>
      ))}
      <li
        className={"page" + (last ? " disabled" : "")}
        onClick={() => {
          !last && setOffset((offset) => offset + 1);
        }}
      >
        {Icons.next}
      </li>
    </ul>
  );
}
