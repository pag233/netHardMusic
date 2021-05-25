import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import "./popup.scss";

export function FixedPopup({ className, closePopup, children, position }) {
  const computedClassName = className ? className + " popup" : "popup";
  const ref = useRef();
  const [visiable, setVisiable] = useState(false);
  //若元素超出屏幕时调整位置
  useEffect(() => {
    const popup = ref.current;
    const popupRect = popup.getBoundingClientRect();
    const viewWidth = window.innerWidth || document.documentElement.clientWidth;
    if (popupRect.right > viewWidth) {
      popup.style.right = 0;
    }
    if (popupRect.left < 0) {
      popup.style.left = 0;
    }
    if (popupRect.bottom > viewWidth) {
      popup.style.bottom = 0;
    }
    if (popupRect.top < 0) {
      popup.style.top = 0;
    }
    setVisiable(true);
  }, []);

  useEffect(() => {
    const mouseDownHandle = (e) => {
      if (!e.isPopup) {
        closePopup();
      }
    };
    if (closePopup && typeof closePopup === "function") {
      document.addEventListener("mousedown", mouseDownHandle);
    }
    return () => {
      document.removeEventListener("mousedown", mouseDownHandle);
    };
  }, [closePopup]);

  return (
    <div
      className={computedClassName}
      ref={ref}
      onMouseDown={(e) => {
        e.nativeEvent.isPopup = true;
      }}
      style={{
        visibility: visiable,
        top: position?.top + "px",
        left: position?.left + "px",
      }}
    >
      {children}
    </div>
  );
}

/**
 *
 * @param {String} alignToAnchor - 弹框与锚点对其位置，默认与锚点元素的底部中线对齐
 * @param {String} anchorId - 必要，作为锚点的元素id，与achorRef互斥
 * @param {Object} anchorRef - 必要，作为锚点的元素id，与anchorId互斥
 * @param {Object} parentElementRef - 默认为document，其直接父元组件的ref，用作判断点击是否发生在父窗体上
 * @param {Function} closePopup - 关闭popup的回调函数
 * @param {Number} leftOffset - 微调与锚点元素的水平间距
 * @param {Number} topOffset - 微调与锚点元素的垂直间距
 */
export function AnchorPopup({
  alignToAnchor = "center",
  anchorId,
  anchorRef,
  children,
  className,
  closePopup,
  parentElementRef,
  leftOffset = 0,
  topOffset = 0,
}) {
  const ref = useRef();
  const computedClassName = className ? className + " popup" : "popup";
  const [visiable, setVisiable] = useState(false);

  useEffect(() => {
    const popup = ref.current;
    const popupRect = popup.getBoundingClientRect();
    const anchorEle = anchorRef?.current || document.getElementById(anchorId);
    const anchorRect = anchorEle.getBoundingClientRect();
    popup.style.top = anchorRect.bottom + topOffset + "px";
    switch (alignToAnchor) {
      case "center":
        popup.style.left =
          anchorRect.left +
          anchorRect.width / 2 -
          popupRect.width / 2 +
          leftOffset +
          "px";
        break;
      case "left":
        popup.style.left = anchorRect.left + leftOffset + "px";
        break;
      case "right":
        popup.style.left = anchorRect.right + leftOffset + "px";
        break;
      case "rtl":
        popup.style.left =
          anchorRect.left - popupRect.width + leftOffset + "px";
        break;
      default:
        break;
    }
    setVisiable(true);
  }, [anchorRef, topOffset, anchorId, alignToAnchor, leftOffset]);

  useEffect(() => {
    const mouseDownHandle = (e) => {
      if (!e.composedPath().includes(ref.current)) {
        e.stopPropagation();
        closePopup();
      }
    };
    const parentElement = parentElementRef?.current ?? document;
    parentElement.addEventListener("mousedown", mouseDownHandle);
    return () => {
      parentElement.removeEventListener("mousedown", mouseDownHandle);
    };
  }, [closePopup, parentElementRef]);

  return (
    <div
      ref={ref}
      className={computedClassName}
      style={{ visibility: visiable ? "visible" : "hidden" }}
    >
      {children}
    </div>
  );
}
AnchorPopup.propTypes = {
  anchorRef: PropTypes.object,
};
