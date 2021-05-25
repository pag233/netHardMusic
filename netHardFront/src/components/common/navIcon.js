import React from "react";
import PropTypes from "prop-types";

import "./navIcon.scss";
export default function Banner({
  orientation,
  className,
  color,
  size = "20px",
  disabledCondition = true,
  disabledClass = "disabled",
  ...props
}) {
  let computedClass = "";
  switch (orientation) {
    case "left":
      computedClass = className ? "icon-left " + className : "icon-left";
      break;
    case "right":
      computedClass = className ? "icon-right " + className : "icon-right";
      break;
    default:
      computedClass = className;
      break;
  }
  return (
    <div
      className={computedClass + (disabledCondition ? "" : " " + disabledClass)}
      {...props}
      style={{ width: size, height: size }}
    >
      <div
        className={"nav-icon" + (disabledCondition ? "" : " " + disabledClass)}
        style={{ borderColor: color }}
      ></div>
    </div>
  );
}

Banner.propTypes = {
  orientation: PropTypes.string.isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  disabledCondition: PropTypes.bool,
  disabledClass: PropTypes.string,
};
