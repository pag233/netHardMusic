import React, { useState, useRef } from "react";

import { AnchorPopup } from "./popup";
import Icons, { emojis } from "./icons";
import "./emojiButton.scss";

function emojiPageMaker() {
  const pages = [];
  let pageIndex;
  for (pageIndex = 0; pageIndex < emojis.length; pageIndex += 30) {
    pages.push(emojis.slice(pageIndex, pageIndex + 30));
  }
  const lines = pages.map((list) => {
    const line = [];
    let pageIndex;
    for (pageIndex = 0; pageIndex < list.length; pageIndex += 10) {
      line.push(list.slice(pageIndex, pageIndex + 10));
    }
    return line;
  });
  return lines;
}

export default function EmojiButton({
  alignToAnchor = "left",
  anchorRef,
  leftOffset = 0,
  parentElementRef,
  textBoxRef,
  topOffset = 0,
}) {
  const [showEmojiPopup, setShowEmojiPopup] = useState();
  const defaultAnchorRef = useRef();

  const [emojiPageNum, setEmojiPageNum] = useState(0);
  const emojiPages = emojiPageMaker();

  return (
    <>
      <span
        className="feature-button"
        ref={defaultAnchorRef}
        onMouseDown={(e) => {
          e.nativeEvent.isPopup = true;
          setShowEmojiPopup(true);
        }}
      >
        ☺
      </span>
      {showEmojiPopup && (
        <AnchorPopup
          alignToAnchor={alignToAnchor}
          anchorRef={anchorRef ? anchorRef : defaultAnchorRef}
          className="emoji-popup"
          closePopup={() => setShowEmojiPopup(false)}
          // isPopupFlag={'isEmojiPopup'}
          leftOffset={leftOffset}
          topOffset={topOffset}
          parentElementRef={parentElementRef}
        >
          <div className="close-popup" onClick={() => setShowEmojiPopup(false)}>
            {Icons.close}
          </div>
          <div
            className="emoji-line-holder"
            onClick={(e) => {
              const textBox = textBoxRef.current;
              if (e.target.className === "emoji") {
                textBox.setRangeText(
                  e.target.innerText,
                  textBox.selectionStart,
                  textBox.selectionEnd,
                  "end"
                );
                textBox.focus();
                setShowEmojiPopup(false);
              }
            }}
          >
            {emojiPages.map(
              (pages, key) =>
                key === emojiPageNum &&
                pages.map((lines, key) => (
                  <div className="emoji-line" key={key}>
                    {lines.map((emoji, key) => (
                      <span className="emoji" key={key}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                ))
            )}
            <div className="spiner-holder">
              {emojiPages.map((_, key) => (
                <span
                  key={key}
                  className={`spiner ${
                    emojiPageNum === key ? "spiner-active" : ""
                  }`}
                  onClick={() => setEmojiPageNum(key)}
                >
                  ●
                </span>
              ))}
            </div>
          </div>
        </AnchorPopup>
      )}
    </>
  );
}
