import React from "react";
import NavLink from "./reduxStore/historyNavLink";
import "./atline.scss";

const atPattern = /(?=@)| /gi;

export default function AtLine({ children, className }) {
  return (
    <span className={`at-line${className ? " " + className : ""}`}>
      {children.split(atPattern).map((word, key) =>
        word.includes("@") ? (
          <NavLink
            className="username"
            key={key}
            to={`/user/info/detail/${word.slice(1)}`}
          >
            {word}
          </NavLink>
        ) : (
          word
        )
      )}
    </span>
  );
}
