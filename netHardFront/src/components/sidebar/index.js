import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import NavLink from "../common/reduxStore/historyNavLink";

import UserStatistics from "../common/user/userStatistics";
import { LoginUserAvatar } from "../common/user/userAvatar";
import { setIdx } from "../common/reduxStore/historyStateSlice";
import {
  addUser,
  login,
  logout,
  usernameSelector,
} from "../common/reduxStore/userSlice";
import {
  useShowPopup,
  setMenuContext,
  setshowLoginPopup,
} from "../common/reduxStore/uiSlice";
import {
  getUserCreatedSonglist,
  getUserFavedSonglist,
  userFavedSonglistSelector,
  userCreatedSonglistsSelector,
} from "../common/reduxStore/songlistsSlice";

import { AnchorPopup, FixedPopup } from "../common/popup";
import { CreateSonglistMoveableBox } from "../common/moveableBox";
import { debounce } from "../common/utils";
import { SonglistContextMenu } from "../common/contextMenu";
import NavIcon from "../common/navIcon";
import SonglistLoadingMessager from "../common/songlistLoadingMessager";

import Icons from "../common/icons";
import "./sidebar.scss";

const domains = ["@qq.com", "@163.com", "@gmail.com", "@sina.com"];

function SideBarTop() {
  const dispatch = useDispatch();
  const idx = useSelector((state) => state.historyState.idx);
  const bottom = useSelector((state) => state.historyState.bottom);
  const top = useSelector((state) => state.historyState.top);

  const canBack = idx <= bottom ? false : true;
  const canForward = idx >= top ? false : true;

  //追踪历史记录状态偏移，设置代表当前记录的idx。
  const popStateHandle = useCallback(
    (e) => {
      dispatch(setIdx({ idx: e.state.state.idx }));
    },
    [dispatch]
  );

  useEffect(() => {
    window.addEventListener("popstate", popStateHandle);
    return () => window.removeEventListener("popstate", popStateHandle);
  }, [popStateHandle]);

  //每当栈底，栈顶更新时记录至会话存储中
  useEffect(() => {
    window.sessionStorage.setItem("bottom", bottom);
    window.sessionStorage.setItem("top", top);
  }, [bottom, top]);
  return (
    <div className="sidebar-top">
      <div className="sidebar-nav-icon-holder">
        <div className="sidebar-nav-icon">
          <NavIcon
            className="sidebar-nav-back"
            orientation="left"
            disabledCondition={canBack}
            onClick={() => {
              canBack && window.history.back();
            }}
          />
          <NavIcon
            className="sidebar-nav-forward"
            orientation="right"
            disabledCondition={canForward}
            onClick={() => {
              canForward && window.history.forward();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ComboBox({ id, inputRef, options = [] }) {
  const [prefix, setPrefix] = useState("");
  const [textAfterAt, setTextAfterAt] = useState("");
  const [selecedtKey, setSelectedKey] = useState(-1);

  const lastOption = options.length;

  const keyPlus = useCallback(() => setSelectedKey((key) => key + 1), []);
  const keySub = useCallback(() => setSelectedKey((key) => key - 1), []);
  const keyDownHandle = useCallback(
    (e) => {
      if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        e.target.value !== "" &&
        prefix
      ) {
        e.preventDefault();
        return keyPlus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        return keySub();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selecedtKey === -1) {
          return setPrefix("");
        }
        e.target.value = document.getElementById(
          id + "-option-" + selecedtKey
        ).innerText;
        setPrefix("");
      } else if (e.key === "Escape") {
        return setPrefix("");
      }
    },
    [keyPlus, keySub, id, selecedtKey, prefix]
  );

  const changeHandle = useCallback((e) => {
    const matchedText = e.target.value.match(/(.+?)@(.*)$/);
    if (matchedText) {
      setTextAfterAt(matchedText[2]);
      return setPrefix(matchedText[1]);
    }
    setTextAfterAt("");
    return setPrefix(e.target.value);
  }, []);

  useEffect(() => {
    const inputEle = inputRef.current;
    inputEle.addEventListener("input", changeHandle);
    inputEle.addEventListener("keydown", keyDownHandle);
    return () => {
      inputEle.removeEventListener("input", changeHandle);
      inputEle.removeEventListener("keydown", keyDownHandle);
    };
  }, [inputRef, changeHandle, keyDownHandle]);

  useEffect(() => {
    if (prefix === "" || selecedtKey === lastOption) setSelectedKey(-1);
    if (selecedtKey === -2) setSelectedKey(lastOption - 1);
  }, [prefix, lastOption, selecedtKey]);

  return (
    prefix.length > 0 && (
      <AnchorPopup
        anchorRef={inputRef}
        className="combo-box-popup"
        closePopup={() => setPrefix("")}
      >
        <ul className="combo-box">
          {options
            .filter((domain) => domain.startsWith("@" + textAfterAt))
            .map((option, key) => (
              <li
                id={id + "-option-" + key}
                key={option + key}
                className={"option " + (selecedtKey === key ? "select" : "")}
                onMouseDown={(e) => {
                  const inputEle = inputRef.current;
                  inputEle.value = e.target.innerText;
                  setPrefix("");
                  setTextAfterAt("");
                }}
              >
                {prefix + option}
              </li>
            ))}
        </ul>
      </AnchorPopup>
    )
  );
}
function Login({ isLogin, closeLoginPopup }) {
  const dispatch = useDispatch();
  //是否显示注册页面
  const [showSignUp, setShowSignUp] = useState(false);
  const toggleShowSignUp = useCallback(() => {
    setShowSignUp((state) => !state);
  }, [setShowSignUp]);

  const [msg, setMsg] = useState();

  useEffect(() => {
    if (isLogin) {
      closeLoginPopup();
      const form = document.forms.identity;
      form.reset();
    }
  }, [isLogin, closeLoginPopup, dispatch]);

  const loading = useSelector((state) => state.user.loading);

  const inputRef = useRef();

  return (
    <div className="login" data-testid="login">
      <div className="close">
        <span
          data-testid="close"
          className="close-icon"
          onClick={() => {
            !loading && closeLoginPopup();
          }}
        >
          {Icons.close}
        </span>
      </div>
      <div className="background-icon">{Icons.mail}</div>
      <form
        id="identity"
        name="identity"
        className="input-wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target;
          const email = form.email;
          const password = form.password;
          if (showSignUp) {
            const confirm = form.confirm;
            if (confirm.value === password.value) {
              const username = form.username;
              dispatch(
                addUser({
                  email: email.value,
                  password: password.value,
                  username: username.value,
                })
              )
                .then(unwrapResult)
                .then(() => {
                  setMsg("注册成功");
                  setTimeout(() => {
                    setMsg("");
                    form.reset();
                    setShowSignUp(false);
                  }, 1000);
                })
                .catch((error) => {
                  // console.log(error);
                  setMsg(error.message);
                });
            } else {
              setMsg("请重新确认密码是否一致");
              password.value = "";
              confirm.value = "";
            }
          } else {
            dispatch(login({ email: email.value, password: password.value }))
              .then(unwrapResult)
              .catch((err) => {
                if (err.message.search(/failed to fetch/i) > -1) {
                  setMsg("网络连接错误");
                } else {
                  setMsg(err.message);
                }
              });
          }
        }}
      >
        <div className="input-holder">
          {Icons.mail}
          <input
            data-testid="email"
            ref={inputRef}
            name="email"
            type="email"
            placeholder="邮箱"
            className="login-input"
          />
          <ComboBox
            id="email-combo-box"
            options={domains}
            inputRef={inputRef}
          />
        </div>
        {
          showSignUp && <div
            className="input-holder"
          >
            {Icons.user}
            <input
              data-testid="username"
              name="username"
              type="text"
              placeholder="用户名"
              required
              className="login-input"
            />
          </div>
        }
        <div className="input-holder">
          {Icons.lock}
          <input
            data-testid="password"
            name="password"
            type="password"
            placeholder="密码"
            required
            className="login-input"
          />
        </div>
        {
          showSignUp && <div
            className="input-holder"
          >
            {Icons.lock}
            <input
              data-testid="confirm"
              name="confirm"
              type="password"
              placeholder="确认密码"
              required
              className="login-input"
            />
          </div>
        }
        <div className="err-msg">{msg}</div>
        <div className="input-holder">
          <input
            data-testid="submit"
            className="login-submit"
            type="submit"
            disabled={loading ? true : false}
            value={showSignUp ? "注册" : "登录"}
          />
        </div>
      </form>
      <div
        data-testid="sign-up"
        className="sign-up"
        onClick={() => {
          if (loading) return;
          //清空错误信息
          setMsg("");
          //清空表单信息
          const form = document.forms.identity;
          form.reset();
          //切换注册显示
          toggleShowSignUp();
        }}
      >
        {showSignUp ? "返回" : "注册新用户"}
      </div>
    </div>
  );
}

/**
 *
 * @param {function} icon - 选项图标
 * @param {string} title - 选项文字
 * @param {string} className - 类
 * @param {string} onClick - 选项onclick
 * @param {boolean} nextLevel - 是否显示三角图标
 * @param {string} subInfo -
 * @param {string} newInfo
 */
function UserSettingItem({
  icon,
  title,
  className,
  onClick = null,
  nextLevel = true,
  subInfo = "",
  newInfo = false,
}) {
  const computedClass = className ? className + " item" : "item";

  return (
    <div className={computedClass} onClick={onClick}>
      {icon}
      <div className="title">
        {title}
        {newInfo && <div className="newInfo"></div>}
      </div>

      {subInfo && <span className="subInfo">{subInfo}</span>}
      {nextLevel && (
        <NavIcon className="next-icon" orientation="right" color="gray" />
      )}
    </div>
  );
}
function UserSetting({ closeSettingPopup }) {
  const dispatch = useDispatch();
  const username = useSelector(usernameSelector);
  return (
    <FixedPopup className="sidebar-avatar-popup" closePopup={closeSettingPopup}>
      <div className="setting" onMouseLeave={closeSettingPopup}>
        <div className="follow section">
          <UserStatistics location="popup" />
          <button className="sign">签到</button>
        </div>
        <div className="shop section">
          <UserSettingItem
            title="会员中心"
            className="no-implementation"
            icon={Icons.user}
            subInfo="未订购"
          />
          <UserSettingItem
            title="等级"
            className="no-implementation"
            icon={Icons.medal}
            subInfo="Lv.1"
          />
          <UserSettingItem
            title="商城"
            className="no-implementation"
            icon={Icons.shop}
            newInfo
          />
        </div>
        <div className="info section">
          <NavLink
            to={`/user/info/detail/${username}`}
            onClick={closeSettingPopup}
          >
            <UserSettingItem title="个人信息设置" icon={Icons.gear} />
          </NavLink>
          <UserSettingItem
            title="社交账号绑定"
            className="no-implementation"
            icon={Icons.chain}
          />
        </div>
        <div className="logout section">
          <UserSettingItem
            title="退出"
            nextLevel={false}
            icon={Icons.exit}
            onClick={() => {
              closeSettingPopup();
              dispatch(logout());
            }}
          />
        </div>
      </div>
    </FixedPopup>
  );
}

function Avatar({ isLogin, toggleLoginPopup }) {
  const settingPopupId = "avatar";
  const {
    showPopup: showSettingPopup,
    togglePopup: toggleSettingPopup,
    closePopup: closeSettingPopup,
  } = useShowPopup(settingPopupId);

  let username = useSelector(usernameSelector);

  if (username && username.length > 6) {
    username = username.slice(0, 7) + "...";
  }

  return (
    <div className="sidebar-avatar">
      {isLogin ? (
        <NavLink to={`/user/info/detail/${username}`}>
          <LoginUserAvatar className="avatar" />
        </NavLink>
      ) : (
        <LoginUserAvatar className="avatar" />
      )}
      {isLogin ? (
        <span
          onMouseDown={(e) => {
            //阻止事件冒泡，防止因不在popup内部单击从而event没有isPopup属性进而导致document捕获事件并将popup关闭
            e.preventDefault();
            toggleSettingPopup();
          }}
        >
          {username}
        </span>
      ) : (
        <span
          onMouseDown={(e) => {
            e.stopPropagation();
            toggleLoginPopup();
          }}
        >
          未登录
        </span>
      )}
      {showSettingPopup && (
        <UserSetting closeSettingPopup={closeSettingPopup} />
      )}
      <span className="arrow">{Icons.arrowRight}</span>
    </div>
  );
}

function mouseMoveHandle(e) {
  const bar = document.getElementById("sidebar");
  bar.style.flexBasis = e.clientX + "px";
}
const deMouseMoveHandle = debounce(mouseMoveHandle, 5);

function mouseOutHandle(e) {
  const from = e.relatedTarget;
  if (!from || from.nodeName === "HTML") {
    document.removeEventListener("mousemove", deMouseMoveHandle);
    document.removeEventListener("mouseup", mouseOutHandle);
    document.removeEventListener("mouseout", mouseOutHandle);
  }
}

function DragArea() {
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", deMouseMoveHandle);
      document.removeEventListener("mouseup", mouseOutHandle);
      document.removeEventListener("mouseout", mouseOutHandle);
    };
  });
  return (
    <div
      className="sidebar-drag-area"
      onMouseDown={() => {
        document.addEventListener("mousemove", deMouseMoveHandle);
        document.addEventListener("mouseup", mouseOutHandle);
        document.addEventListener("mouseout", mouseOutHandle);
      }}
    ></div>
  );
}

function ToggleList({ children, listname, showlist, setShowlist }) {
  return (
    <li className="sidebar-list-title title-with-icon">
      <span className={"sidebar-title-header-icon" + (showlist ? "" : " drop")}>
        {Icons.arrowDown}
      </span>
      <span
        onClick={() => {
          setShowlist((show) => !show);
        }}
      >
        {listname}
      </span>
      {children}
    </li>
  );
}
function CreatedSonglist({ isLogin, toggleLoginPopup }) {
  const dispatch = useDispatch();
  const [showlist, setShowlist] = useState(true);
  const userCreatedSonglists = useSelector(userCreatedSonglistsSelector);
  useEffect(() => {
    if (isLogin) {
      dispatch(getUserCreatedSonglist());
    }
  }, [dispatch, isLogin]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showCreateSonglist, setShowCreateSonglist] = useState(false);
  return (
    <ul className="sidebar-list">
      <ToggleList
        listname="创建的歌单"
        showlist={showlist}
        setShowlist={setShowlist}
      >
        <span
          className="sidebar-title-rear-icon"
          onClick={() => {
            if (isLogin) {
              setShowCreateSonglist(true);
            } else {
              toggleLoginPopup();
            }
          }}
        >
          +
        </span>
      </ToggleList>
      {showCreateSonglist && (
        <CreateSonglistMoveableBox
          closeBox={() => setShowCreateSonglist(false)}
        />
      )}
      {isLogin ? (
        showlist &&
        userCreatedSonglists.map((songlist) => {
          return (
            <NavLink to={`/songlist/detail/${songlist._id}`} key={songlist._id}>
              <li
                className="sidebar-item created-songlist-item"
                data-songlist-id={songlist._id}
                data-isfav={!songlist.deleteable}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowContextMenu(true);
                  dispatch(
                    setMenuContext({
                      position: {
                        top: e.clientY,
                        left: e.clientX,
                      },
                      songlist_id: songlist._id,
                    })
                  );
                }}
              >
                <span className="sidebar-icon">{Icons[songlist.icon]}</span>
                <span className="sidebar-song-name">{songlist.name}</span>
              </li>
            </NavLink>
          );
        })
      ) : (
        <NavLink to="/songlist/detail/offline">
          <li
            className="sidebar-item created-songlist-item"
            data-songlist-id="offline"
            data-isfav={true}
          >
            <span className="sidebar-icon">{Icons.fav}</span>
            <span className="sidebar-song-name">我喜欢的音乐</span>
          </li>
        </NavLink>
      )}
      {showContextMenu && (
        <SonglistContextMenu
          className="sidebar-songlist-menu-context"
          closeContextMenu={() => setShowContextMenu(false)}
        />
      )}
    </ul>
  );
}

function FavedSonglist() {
  const dispatch = useDispatch();
  const favedlists = useSelector(userFavedSonglistSelector);
  const [showlist, setShowlist] = useState(true);

  useEffect(() => {
    dispatch(getUserFavedSonglist({ type: "list" }));
  }, [dispatch]);

  return (
    <ul className="sidebar-list favorites-list">
      <ToggleList
        listname="收藏的歌单"
        showlist={showlist}
        setShowlist={setShowlist}
      ></ToggleList>
      {showlist &&
        favedlists.map((lists) => (
          <NavLink to={`/songlist/detail/${lists._id}`} key={lists._id}>
            <li className="sidebar-item">
              <span className="sidebar-icon">{Icons.music}</span>
              {lists.name}
            </li>
          </NavLink>
        ))}
    </ul>
  );
}
function SideBarBottom() {
  const isLogin = useSelector((state) => state.user.isLogin);
  const dispatch = useDispatch();
  const showLoginPopup = useSelector((state) => state.ui.showLoginPopup);
  return (
    <div className="sidebar-bottom">
      <DragArea />
      <nav className="sidebar-nav">
        <Avatar
          isLogin={isLogin}
          toggleLoginPopup={() => dispatch(setshowLoginPopup(!showLoginPopup))}
        />
        {showLoginPopup && (
          <FixedPopup
            className="login-popup"
            closePopup={() => dispatch(setshowLoginPopup(false))}
          >
            <Login
              isLogin={isLogin}
              closeLoginPopup={() => dispatch(setshowLoginPopup(false))}
            />
          </FixedPopup>
        )}
        <ul className="sidebar-list ">
          <NavLink to="/discovery" activeclass="active">
            <li className="sidebar-item">
              <div className="sidebar-icon">{Icons.cloudMusic}</div>
              <span>发现音乐</span>
            </li>
          </NavLink>
        </ul>
        <ul className="sidebar-list">
          <li className="sidebar-list-title">我的音乐</li>
          <NavLink to="/download" activeclass="active">
            <li className="sidebar-item">
              <span className="sidebar-icon">{Icons.download}</span>
              <span>下载管理</span>
            </li>
          </NavLink>
        </ul>
        <CreatedSonglist
          isLogin={isLogin}
          toggleLoginPopup={() => dispatch(setshowLoginPopup(!showLoginPopup))}
        />
        {isLogin && <FavedSonglist />}
      </nav>
    </div>
  );
}
function SideBar() {
  return (
    <div id="sidebar" className="sidebar">
      <SideBarTop />
      <SideBarBottom />
      <SonglistLoadingMessager />
    </div>
  );
}

export default SideBar;
