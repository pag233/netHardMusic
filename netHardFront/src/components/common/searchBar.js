import React from "react";
import Icons from "./icons";

import "./searchBar.scss";

const focusHandler = (e) => {
  if (!e.target.value) {
    e.target.setAttribute("placeholder", "");
  }
};
const focusoutHandler = (e) => {
  if (!e.target.value) {
    e.target.setAttribute("placeholder", "搜索");
  }
};

export default function SearchBar({
  className,
  searchStr,
  setSearchStr,
  onChange,
  ...props
}) {
  return (
    <div className="search-bar">
      <span className="search-icon" onClick={() => setSearchStr("")}>
        {searchStr === "" ? Icons.search : Icons.close}
      </span>
      <input
        value={searchStr}
        onChange={onChange}
        className={className ? className + " input-bar" : "input-bar"}
        type="text"
        name="search-bar"
        placeholder="搜索"
        onFocus={focusHandler}
        onBlur={focusoutHandler}
        {...props}
      />
    </div>
  );
}
