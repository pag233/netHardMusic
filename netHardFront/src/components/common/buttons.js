import React from "react";
import "./button.scss";

/**
 *
 * @param {String} type - "normal" | "round" | "confirm" | "save" | "circle"
 */
export function Button({ children, className, type = "normal", ...props }) {
  return (
    <button
      className={`button ${type + "-btn"} ${className ? className : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
