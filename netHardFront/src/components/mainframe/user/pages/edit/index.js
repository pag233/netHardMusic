import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";

import {
  uploadAvatar,
  usernameSelector,
  uploadInfo,
} from "../../../../common/reduxStore/userSlice";
import { useLoginOnly } from "../../../../common/hooks";

import { fetchData } from "../../../../common/fetch";

import { LoginUserAvatar } from "../../../../common/user/userAvatar";
import provinceList from "./province";
import cityObject from "./city";
import { BackEnd } from "../../../../common/utils";

import "./edit.scss";

const to = new Date().getFullYear();
const from = to - 100;

export default function UserInfoEdit() {
  useLoginOnly();

  const dispatch = useDispatch();
  const [username, setUsername] = useState(useSelector(usernameSelector));
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState({
    description: "",
    gender: "0",
    year: from,
    month: 1,
    day: 1,
    province: provinceList[0].id,
    city: cityObject["110000000000"][0].id,
  });
  const isLeapYear = (year) => new Date(year, 1, 29).getDate() === 29;

  const years = useMemo(() => {
    const options = [];
    let i = to;
    while (i >= from) {
      options.push(i);
      i--;
    }
    return options.map((year) => (
      <option value={year} key={year}>
        {year}年
      </option>
    ));
  }, []);
  const days = useMemo(
    () => (
      <>
        <option value="1">1日</option>
        <option value="2">2日</option>
        <option value="3">3日</option>
        <option value="4">4日</option>
        <option value="5">5日</option>
        <option value="6">6日</option>
        <option value="7">7日</option>
        <option value="8">8日</option>
        <option value="9">9日</option>
        <option value="10">10日</option>
        <option value="11">11日</option>
        <option value="12">12日</option>
        <option value="13">13日</option>
        <option value="14">14日</option>
        <option value="15">15日</option>
        <option value="16">16日</option>
        <option value="17">17日</option>
        <option value="18">18日</option>
        <option value="19">19日</option>
        <option value="20">20日</option>
        <option value="21">21日</option>
        <option value="22">22日</option>
        <option value="23">23日</option>
        <option value="24">24日</option>
        <option value="25">25日</option>
        <option value="26">26日</option>
        <option value="27">27日</option>
        <option value="28">28日</option>
        {info.month !== 2 ? (
          <>
            <option value="29">29日</option>
            <option value="30">30日</option>
            {[1, 3, 5, 7, 8, 10, 12].includes(info.month) && (
              <option value="31">31日</option>
            )}
          </>
        ) : (
          isLeapYear(info.year) && <option value="29">29日</option>
        )}
      </>
    ),
    [info.month, info.year]
  );

  const provinces = useMemo(
    () =>
      provinceList.map((p) => (
        <option value={p.id} key={p.id}>
          {p.name}
        </option>
      )),
    []
  );

  const cities = useMemo(
    () =>
      cityObject[info.province].map((c) => (
        <option value={c.id} key={c.id}>
          {c.name}
        </option>
      )),
    [info.province]
  );

  const [infoLoaded, setInfoLoaded] = useState(false);
  const changeHandle = useCallback(
    (field) => (e) => {
      e.persist();
      setInfo((info) => ({ ...info, [field]: e.target.value }));
    },
    []
  );

  useEffect(() => {
    const url = new URL(BackEnd.address + "/user/info");
    url.searchParams.append("username", username);
    fetchData(url, "GET")
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (Object.keys(jsonResponse).length > 0) {
          const { description, gender, birth, province, city } = jsonResponse;
          const date = new Date(birth);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          setInfo((info) => ({
            ...info,
            description,
            gender,
            year,
            month,
            day,
            province,
            city,
          }));
        }
        setInfoLoaded(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dispatch, username]);
  return (
    <div className="main-body-user-info-edit">
      {infoLoaded && (
        <>
          <h2 className="title">编辑个人信息</h2>
          <form
            id="info"
            action=""
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatch(uploadInfo({ username, ...info }))
                .then(unwrapResult)
                .then(async (res) => {
                  res.status === "done" && setMsg("保存成功");
                })
                .catch((err) => {
                  if (err.message.search(/failed to fetch/i) > -1) {
                    setMsg("网络连接错误");
                  } else {
                    setMsg(err.message);
                  }
                  setTimeout(() => {
                    setMsg("");
                  }, [2000]);
                });
            }}
          >
            <div className="input-holder">
              <label htmlFor="username">昵称：</label>
              <input
                type="text"
                name="username"
                id="username"
                className="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-holder">
              <label htmlFor="description">介绍：</label>
              <textarea
                value={info.description}
                name="description"
                id="description"
                className="description"
                onChange={changeHandle("description")}
              />
            </div>
            <div>
              <span>性别：</span>
              <input
                type="radio"
                name="gender"
                id="privacy"
                value="0"
                checked={info.gender === "0"}
                onChange={changeHandle("gender")}
              />
              <label htmlFor="privacy">保密</label>
              <input
                type="radio"
                name="gender"
                id="male"
                value="1"
                checked={info.gender === "1"}
                onChange={changeHandle("gender")}
              />
              <label htmlFor="male">男</label>
              <input
                type="radio"
                name="gender"
                id="female"
                value="2"
                checked={info.gender === "2"}
                onChange={changeHandle("gender")}
              />
              <label htmlFor="female">女</label>
            </div>
            <div>
              <span>生日：</span>
              <select
                name="year"
                id="year"
                className="select"
                value={info.year}
                onChange={changeHandle("year")}
              >
                {years}
              </select>
              <select
                name="month"
                id="month"
                className="select"
                value={info.month}
                onChange={changeHandle("month")}
              >
                <option value="1">1月</option>
                <option value="2">2月</option>
                <option value="3">3月</option>
                <option value="4">4月</option>
                <option value="5">5月</option>
                <option value="6">6月</option>
                <option value="7">7月</option>
                <option value="8">8月</option>
                <option value="9">9月</option>
                <option value="10">10月</option>
                <option value="11">11月</option>
                <option value="12">12月</option>
              </select>
              <select
                name="day"
                id="day"
                className="select"
                value={info.day}
                onChange={changeHandle("day")}
              >
                {days}
              </select>
            </div>
            <div>
              <span>地区：</span>
              <select
                name="province"
                id="province"
                className="select province"
                value={info.province}
                onChange={changeHandle("province")}
              >
                {provinces}
              </select>
              <select
                name="city"
                id="city"
                className="select"
                value={info.city}
                onChange={changeHandle("city")}
              >
                {cities}
              </select>
            </div>
            <div>
              <input className="confirm" type="submit" value="保存" />
              <input
                className="cancel"
                type="button"
                value="取消"
                onClick={() => window.history.back()}
              />
            </div>
            <span className="info-msg">{msg}</span>
          </form>
          <div className="avatar-holder">
            <LoginUserAvatar className="avatar" />
            <label className="avatar-edit" htmlFor="avatar">
              修改头像
            </label>
            <input
              type="file"
              name="avatar"
              id="avatar"
              accept="image/*"
              encType="multipart/form-data"
              hidden
              onChange={(e) => {
                const image = e.target.files[0];
                dispatch(uploadAvatar({ image }))
                  .then(unwrapResult)
                  .then((res) => {
                    res.status === "done" && setMsg("保存头像成功");
                    setTimeout(() => {
                      setMsg("");
                    }, 2000);
                  })
                  .catch((err) => {
                    if (err.message.search(/failed to fetch/i) > -1) {
                      setMsg("网络连接错误");
                    } else {
                      setMsg(err.message);
                    }
                    setTimeout(() => {
                      setMsg("");
                    }, [2000]);
                  });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
