import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { debounce } from "./utils";
import { postUserCreatedSonglist } from "./reduxStore/songlistsSlice";
import { contextMenuSelector } from "./reduxStore/uiSlice";
import Icons from "./icons";
import "./moveableBox.scss";

export default function MoveableBox({ closeBox, children }) {
  //鼠标坐标
  const [mouseOffset, setMouseOffset] = useState();
  //防止闪烁
  const [visiable, setVisiable] = useState(false);
  //box移动开关
  const [startMoving, setStartMoving] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const box = ref.current;
    const boxRect = box.getBoundingClientRect();
    box.style.left = boxRect.x - boxRect.width / 2 + "px";
    box.style.top = boxRect.y - boxRect.height / 2 + "px";
    setVisiable(true);
  }, []);

  useEffect(() => {
    const mouseUpHandle = () => {
      setStartMoving(false);
    };
    const mouseMoveHandle = (e) => {
      if (!startMoving) return;
      const box = ref.current;
      box.style.left = e.clientX - mouseOffset?.mouseOffsetX + "px";
      box.style.top = e.clientY - mouseOffset?.mouseOffsetY + "px";
    };
    const deMouseMoveHandle = debounce(mouseMoveHandle, 6);

    document.addEventListener("mouseup", mouseUpHandle);
    document.addEventListener("mousemove", deMouseMoveHandle);
    return () => {
      document.removeEventListener("mouseup", mouseUpHandle);
      document.removeEventListener("mousemove", deMouseMoveHandle);
    };
  }, [startMoving, mouseOffset]);

  return (
    <div
      className="moveable-box"
      ref={ref}
      style={{
        visibility: visiable ? "visible" : "hidden",
      }}
    >
      <div
        className="moveable-area"
        onMouseDown={(e) => {
          const box = ref.current;
          const boxRect = box.getBoundingClientRect();
          setMouseOffset({
            mouseOffsetX: e.clientX - boxRect.x,
            mouseOffsetY: e.clientY - boxRect.y,
          });
          setStartMoving(true);
        }}
      ></div>
      <div
        className="moveable-close"
        onClick={() => typeof closeBox === "function" && closeBox()}
      >
        {Icons.close}
      </div>
      {children}
    </div>
  );
}

export function CreateSonglistMoveableBox({
  addTracksAfterCreate,
  closeBox,
  closeContextMenu,
}) {
  const dispatch = useDispatch();
  useEffect(() => () => closeContextMenu && closeContextMenu());

  const context = useSelector(contextMenuSelector);

  return (
    <MoveableBox closeBox={closeBox}>
      <div className="new-songlist-container">
        <h2 className="new-songlist-title">新建歌单</h2>
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            if (!form.title.value) {
              //Todo: 提示用户
              return console.error("歌单标题不能为空");
            }
            dispatch(
              postUserCreatedSonglist({
                body: {
                  name: form.title.value,
                  private: form.private.checked,
                  tracks: addTracksAfterCreate ? context.track : undefined,
                },
              })
            ).then(() => closeBox());
          }}
        >
          <input
            type="text"
            placeholder="请输入歌单标题"
            className="songlist-title-input"
            name="title"
            id=""
            required
          />
          <input
            type="checkbox"
            name="private"
            id="private"
            className="songlist-private"
          />
          <label className="private-label" htmlFor="private">
            设置为隐私歌单
          </label>
          <input type="submit" value="提交" className="songlist-submit" />
        </form>
      </div>
    </MoveableBox>
  );
}
CreateSonglistMoveableBox.propTypes = {
  afterCreate: PropTypes.func,
};
