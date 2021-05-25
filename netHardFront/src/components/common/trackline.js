import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { putFavTrack, addTrackToSonglist } from "./reduxStore/songlistsSlice";

import "./trackline.scss";
export default function TrackLine({
  children,
  className,
  selected,
  track,
  ...props
}) {
  const dispatch = useDispatch();
  //拖拽歌曲至歌单窗体
  const dragBoxRef = useRef();
  const [showDragBox, setShowDragBox] = useState();
  const [dragBoxContent, setDragBoxContent] = useState();
  return (
    <li
      className={
        "track-line " + (className ?? "") + (selected ? " line-selectd" : "")
      }
      {...props}
      onMouseDown={(e) => {
        if (e.button === 0) {
          //处理单曲拖放
          const container = document.getElementById("container");
          const startPosition = { left: e.clientX, top: e.clientY };
          const dragBoxOffset = 15;
          setDragBoxContent(track.name);
          function tarckLineMouseMoveHandle(e) {
            !showDragBox && setShowDragBox(true);
            const dragBox = dragBoxRef.current;
            if (dragBox) {
              dragBox.style.left = e.clientX + dragBoxOffset + "px";
              dragBox.style.top = e.clientY + dragBoxOffset + "px";
              if (
                e.target.classList.contains("created-songlist-item") ||
                e.target.parentElement.classList.contains(
                  "created-songlist-item"
                )
              ) {
                container.style.cursor = "default";
              } else {
                container.style.cursor = "not-allowed";
              }
            }
          }
          function trackLineMouseUpHandle(e) {
            document.removeEventListener("mouseup", trackLineMouseUpHandle);
            document.removeEventListener("mousemove", tarckLineMouseMoveHandle);
            container.style.cursor = "default";
            //当列表是我最喜欢的音乐时，将该歌曲加入favtrack
            let isFav;
            let songlistId;
            if (
              e.target.classList.contains("created-songlist-item") ||
              e.target.parentElement.classList.contains("created-songlist-item")
            ) {
              songlistId =
                e.target.dataset.songlistId ||
                e.target.parentElement.dataset.songlistId;
              isFav =
                e.target.dataset.isfav || e.target.parentElement.dataset.isfav;
            }
            if (songlistId) {
              dispatch(
                addTrackToSonglist({
                  songlist_id: songlistId,
                  track,
                })
              );
              if (isFav === "true") {
                dispatch(putFavTrack({ track }));
              }
              setShowDragBox(false);
              setDragBoxContent();
            } else {
              const dragBox = dragBoxRef.current;
              if (dragBox) {
                dragBox.classList.add("going-back");
                dragBox.style.left = startPosition.left + "px";
                dragBox.style.top = startPosition.top + "px";
                return dragBox.addEventListener(
                  "transitionend",
                  function TransEnd() {
                    dragBox.removeEventListener("transitionend", TransEnd);
                    dragBox.classList.remove("going-back");
                    setShowDragBox(false);
                    setDragBoxContent();
                  }
                );
              }
            }
          }
          document.addEventListener("mousemove", tarckLineMouseMoveHandle);
          document.addEventListener("mouseup", trackLineMouseUpHandle);
        }
      }}
    >
      {children}
      {showDragBox && (
        <div className="trackline-drag-box" ref={dragBoxRef}>
          {dragBoxContent}
        </div>
      )}
    </li>
  );
}
