import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router-dom";

import NavLink from "./reduxStore/historyNavLink";

import { isLoginSelector } from "./reduxStore/userSlice";
import { saveTheme } from "./reduxStore/themeSlice";
import {
  searchStrSelector,
  setSearchStr,
} from "./reduxStore/searchSlice";
import { setIdx, incrIdx } from "./reduxStore/historyStateSlice";
import {
  useShowPopup,
  sideDockerSelector,
  setSideDocker,
  setNewMessages,
} from "./reduxStore/uiSlice";

import { BackEnd } from "./utils";
import { fetchData, fetchDataWithToken } from "./fetch";
import { FixedPopup } from "./popup";
import routeFactory from "./RouteFactory";
import SearchBar from "./searchBar";

import Icons from "./icons";

const keyRoot = process.env.REACT_APP_LOCALSTORAGEROOTKEY;

function NavLinks({ routes, parentPath }) {
  return routes.map(({ path, name }) => {
    if (!name) {
      return null;
    }
    return (
      <li id={path} key={path} className="main-header-nav-link">
        <NavLink to={parentPath + path} activeClassName="selected">
          {name}
        </NavLink>
      </li>
    );
  });
}

function ThemeOption(props) {
  const dispatch = useDispatch();
  const { themeColor, themeTitle } = props;
  const currentTheme = useSelector((state) => state.theme.current);
  const radic = <span className="check"></span>;
  return (
    <div
      className="theme-option"
      onMouseDown={() => {
        dispatch(saveTheme(themeColor));
      }}
    >
      <div className={"option-icon " + themeColor}>
        {themeColor === currentTheme && radic}
      </div>
      <div className="option-title">{themeTitle}</div>
    </div>
  );
}
function ThemeOptionHolder({ closePopup }) {
  return (
    <div className="theme-options-holder" onMouseLeave={closePopup}>
      <ThemeOption themeColor="theme-light" themeTitle="浅色" />
      <ThemeOption themeColor="theme-red" themeTitle="红色" />
      <ThemeOption themeColor="theme-dark" themeTitle="深色" />
    </div>
  );
}
function ThemeOptionButton() {
  const popupId = "theme";
  const { showPopup, closePopup, togglePopup } = useShowPopup(popupId);
  return (
    <li
      className="main-header-option"
      onMouseDown={(e) => {
        e.stopPropagation();
        togglePopup();
      }}
    >
      {Icons.theme}
      {showPopup && (
        <FixedPopup className="theme-option-popup" closePopup={closePopup}>
          <ThemeOptionHolder closePopup={closePopup} />
        </FixedPopup>
      )}
    </li>
  );
}
const fetchInterval = Number(process.env.REACT_APP_POLLS_INTERVAL);
function Header(props) {
  const dispatch = useDispatch();
  const history = useHistory();

  const docker = useSelector(sideDockerSelector);
  const searchStr = useSelector(searchStrSelector);

  const [newMessage, setNewMessage] = useState(0);

  const isLogin = useSelector(isLoginSelector);

  useEffect(() => {
    //轮询是否有新信息
    function fetchNewMessageCount() {
      fetchDataWithToken(
        fetchData,
        BackEnd.address + "/message/newMessageCount",
        "GET",
        {
          keyRoot,
        }
      )
        .then((res) => res.json())
        .then((jsonRes) => {
          let totalNewMessage = Number(jsonRes.totalNewMessage);
          totalNewMessage = totalNewMessage > 99 ? 99 : totalNewMessage;
          setNewMessage(totalNewMessage);
          dispatch(setNewMessages({ newMessages: jsonRes.newMessages }));
        });
    }

    let id;
    if (isLogin && fetchInterval > 0) {
      setTimeout(() => {
        fetchNewMessageCount();
        id = setInterval(() => {
          fetchNewMessageCount();
        }, [fetchInterval]);
      }, 0);
    }
    return () => clearInterval(id);
  }, [dispatch, isLogin]);

  return (
    <div className="main-header main-header-font">
      <ul className="main-header-nav">
        <NavLinks {...props} />
      </ul>
      <ul className="main-header-search-and-options">
        <li className="main-header-search">
          <SearchBar
            searchStr={searchStr}
            setSearchStr={(str) => {
              dispatch(setSearchStr(str));
            }}
            className="header-search-bar"
            onChange={(e) => {
              dispatch(setSearchStr(e.target.value));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                history.push(`/search/result/song/${e.target.value}`);
                dispatch(incrIdx());
              }
            }}
          />
        </li>
        <li className="main-header-option no-implementation">{Icons.gear}</li>
        <li
          data-testid="message-option"
          className="main-header-option message-option"
          onMouseDown={(e) => {
            //阻止事件冒泡，防止因不在popup内部单击从而event没有isPopup属性进而导致document捕获事件并将popup关闭
            e.preventDefault();
            dispatch(
              setSideDocker({
                show: !docker.show,
                children: "message",
              })
            );
          }}
        >
          {Icons.mail}
          {newMessage > 0 && <div className="new-message">{newMessage}</div>}
        </li>
        <ThemeOptionButton className="option-select-icon" />
      </ul>
    </div>
  );
}

function Body({ routes }) {
  const dispatch = useDispatch();
  const idx = useSelector((state) => state.historyState.idx);
  //因为react-router中使用了history库，所以使用原生window.history api时需要replace({state:{idx}})。
  //新页面初始化idx，旧页面从页面的history.state.state.idx中恢复。
  useEffect(() => {
    if (!window.history.state || !window.history.state.state) {
      window.history.replaceState({ state: { idx } }, "", document.URL);
    } else if (window.history.state.state.idx) {
      dispatch(setIdx({ idx: window.history.state.state.idx }));
    }
  }, [idx, dispatch]);

  return (
    <div className="main-body" id="main-body">
      {routeFactory(routes)}
    </div>
  );
}

export default function FrameFactory(routes) {
  const parentPath = useRouteMatch().path;
  return (
    <>
      <Header routes={routes} parentPath={parentPath} />
      <Body routes={routes} parentPath={parentPath} />
    </>
  );
}
