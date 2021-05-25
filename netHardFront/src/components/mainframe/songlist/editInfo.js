import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useParams } from "react-router";

import {
  songlistDetailSelector,
  getSonglistDetail,
  updateSonglistDetail,
} from "../../common/reduxStore/songlistsSlice";
import NavLink from "../../common/reduxStore/historyNavLink";

import { Button } from "../../common/buttons";
import { useLoginOnly } from "../../common/hooks";
import AddTagsPopup from "./tags";
import Icons from "../../common/icons";

import "./editInfo.scss";

export default function EditInfo() {
  useLoginOnly();
  const dispatch = useDispatch();

  const { songlist_id } = useParams();
  const songlist = useSelector(songlistDetailSelector);

  const nameRef = useRef();
  const txtRef = useRef();
  const addTagAnchorRef = useRef();
  const formRef = useRef();

  const [tags, setTags] = useState([]);

  const [showAddTag, setShowAddTag] = useState(false);

  const [msg, setMsg] = useState();
  useEffect(() => {
    const inputElem = nameRef.current;
    const txtElem = txtRef.current;
    //没有或有新的songlist detail时，获取songlist detail
    if (Object.keys(songlist).length === 0 || songlist_id !== songlist?._id) {
      dispatch(getSonglistDetail({ songlist_id, type: "edit" }))
        .then(unwrapResult)
        .then((res) => {
          inputElem.value = res.name;
          txtElem.value = res.description;
          setTags(res.tags);
        });
    } else {
      inputElem.value = songlist.name;
      txtElem.value = songlist.description;
      setTags(songlist.tags);
    }
  }, [dispatch, songlist_id, songlist]);

  useEffect(() => {
    let msgTimeOutId;
    if (msg) {
      msgTimeOutId = setTimeout(() => {
        setMsg("");
      }, 2000);
    }
    return () => clearTimeout(msgTimeOutId);
  }, [msg]);

  return (
    <div className="songlist-info">
      <div className="cover-holder">
        <div className="cover">
          {songlist.coverUrl ? (
            <img className="cover-img" src={songlist.coverUrl} alt="" />
          ) : (
            Icons.music
          )}
        </div>
        <Button
          className="edit-cover"
          onClick={() => {
            const form = formRef.current;
            const file = form.cover;
            file.click();
          }}
        >
          编辑封面
        </Button>
      </div>
      <form ref={formRef} className="edit-songlist-info">
        <div className="name-holder">
          <label className="name-label" htmlFor="name">
            歌单名:
          </label>
          <input
            ref={nameRef}
            className="name-input"
            type="text"
            name="name"
            id="name"
          />
        </div>
        <div className="tag-holder">
          <span className="tag-label">标签:</span>
          {tags.map((tag, key) => (
            <span className="tag" key={"songlist-edit" + key}>
              {tag}
            </span>
          ))}
          <span
            ref={addTagAnchorRef}
            className="add-tag"
            onMouseDown={() => {
              setShowAddTag((s) => !s);
            }}
          >
            添加标签
          </span>
        </div>
        <div className="description-holder">
          <label className="description-label" htmlFor="description-label">
            简介:
          </label>
          <textarea
            ref={txtRef}
            className="description-iput"
            name="description"
            id="description"
            cols="30"
            rows="10"
          ></textarea>
        </div>
        <div className="button-holder">
          <Button
            className="btn-confirm"
            type="save"
            onClick={(e) => {
              e.preventDefault();
              const form = formRef.current;
              const { name, description } = form;
              dispatch(
                updateSonglistDetail({
                  songlist_id: songlist_id,
                  info: {
                    name: name.value,
                    description: description.value,
                    tags,
                  },
                })
              )
                .then(() => setMsg("保存成功"))
                .catch((err) => setMsg(err));
            }}
          >
            保存
          </Button>
          <NavLink to={`/songlist/detail/${songlist_id}`}>
            <Button className="btn-confirm">取消</Button>
          </NavLink>
        </div>
        <input
          type="file"
          name="cover"
          id=""
          encType="multipart/form-data"
          accept="image/*"
          hidden
          onChange={() => {
            const form = formRef.current;
            const cover = form.cover.files[0];
            dispatch(
              updateSonglistDetail({
                songlist_id,
                cover,
              })
            );
          }}
        />
        <div className="msg">{msg}</div>
      </form>
      {showAddTag && (
        <AddTagsPopup
          tags={tags}
          anchorRef={addTagAnchorRef}
          closePopup={() => {
            setShowAddTag(false);
          }}
          button={() => (
            <Button
              className="done"
              type="confirm"
              onClick={() => {
                const tagNodes = Array.from(
                  document.querySelectorAll(".selected-tag")
                );
                if (tagNodes.length !== 0) {
                  setTags(tagNodes.map((tag) => tag.innerText));
                } else {
                  setTags([]);
                }
                setShowAddTag(false);
              }}
            >
              完成
            </Button>
          )}
        />
      )}
    </div>
  );
}
