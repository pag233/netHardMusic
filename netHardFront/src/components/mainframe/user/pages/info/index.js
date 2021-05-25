import React, { useState, useEffect } from "react";
import { useParams } from "react-router";

import NavLink from "../../../../common/reduxStore/historyNavLink";

import { Button } from "../../../../common/buttons";
import { fetchData } from "../../../../common/fetch";
import {
  setSession,
  setSideDocker,
} from "../../../../common/reduxStore/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  usernameSelector,
  userIdSelector,
} from "../../../../common/reduxStore/userSlice";
import UserAvatar from "../../../../common/user/userAvatar";
import UserStatistics from "../../../../common/user/userStatistics";

import { BackEnd } from "../../../../common/utils";
import { useLoginOnly } from "../../../../common/hooks";
import { UserInfoPlayLists } from "../../../../common/songlist";

import Icons from "../../../../common/icons";
import "./info.scss";

export default function Info() {
  //未登录自动跳转至主页
  useLoginOnly();
  const dispatch = useDispatch();

  const { username } = useParams();
  const userid = useSelector(userIdSelector);
  const loginUsername = useSelector(usernameSelector);

  const isCurrentUser = username === loginUsername;

  const [foundUser, setFoundUser] = useState(false);

  const [info, setInfo] = useState({
    songlists: [],
    favSonglists: [],
  });

  useEffect(() => {
    const url = new URL(BackEnd.address + "/user/info");
    url.searchParams.append("username", username);
    url.searchParams.append("type", "detail");
    fetchData(url, "GET").then(async (res) => {
      const jsonResponse = await res.json();
      if (jsonResponse.status === "done") {
        setInfo(jsonResponse);
        setFoundUser(true);
      } else if (jsonResponse.error === "用户不存在") {
        setInfo((info) => ({ ...info, username: "未找到该用户" }));
      }
    });
  }, [username]);

  return (
    <div className="main-body-user-info">
      <div className="summary">
        <UserAvatar
          className="avatar"
          avatar={info.avatarURL && BackEnd.address + info.avatarURL}
        />
        <div className="title">
          <span className="username">{info.username}</span>
          <div className="edit">
            {isCurrentUser ? (
              <NavLink to="/user/info/edit">
                <Button>编辑个人信息</Button>
              </NavLink>
            ) : (
              foundUser && (
                <>
                  <Button
                    className="media-button"
                    onClick={() => {
                      dispatch(
                        setSideDocker({
                          show: true,
                          children: "session",
                        })
                      );
                      dispatch(
                        setSession({
                          session: {
                            avatarURL: info.avatarURL,
                            userId: userid,
                            username: info.username,
                          },
                        })
                      );
                    }}
                  >
                    {Icons.message}发私信
                  </Button>
                  <Button className="media-button">
                    <span className="plus">{Icons.plus}</span> 关注
                  </Button>
                  <Button className="media-button" type="circle">
                    •••
                  </Button>
                </>
              )
            )}
          </div>
          <div className="statistics">
            <UserStatistics location="userinfo" />
          </div>
          <div className="profile">
            <span>个人介绍:{info.description}</span>
          </div>
        </div>
      </div>
      <UserInfoPlayLists title="我创建的歌单" list={info.songlists} />
      <UserInfoPlayLists title="我收藏的歌单" list={info.favSonglists} />
    </div>
  );
}
