import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import { setOffset, offsetSelector } from "./reduxStore/commentSlice";
import { songlistDetailSelector } from "./reduxStore/songlistsSlice";

import UserAvatar from "./user/userAvatar";
import { BackEnd, isOffline, parseDate } from "./utils";
import {
  commentLinesSelector,
  featuredCommentsSelector,
  getComment,
  likeComment,
} from "./reduxStore/commentSlice";
import AtLine from "./atLine";
import NavLink from "./reduxStore/historyNavLink";
import PageNav from "./pageNav";
import StaticInputBox from "./staticInputBox";

import Icons from "./icons";
import "./comment.scss";

function CommentSection({
  title,
  commentLines,
  songlist_id,
  setReplyTo,
  whenEmpty = "",
  pageNav,
}) {
  const dispatch = useDispatch();
  return commentLines.length > 0 ? (
    <div className="feature-section">
      <h4 className="comment-title">{title}</h4>
      <ul className="comment-holder">
        {commentLines.map((line, index) => {
          return (
            <li className="comment-line" key={line._id} data-testid="test-comment-line">
              <NavLink to={`/user/info/detail/${line.user.username}`}>
                <UserAvatar
                  className="comment-avatar"
                  avatar={
                    line.user.avatarURL && BackEnd.address + line.user.avatarURL
                  }
                />
              </NavLink>
              <div className="comment-detail">
                <div className="comment-user-line">
                  <NavLink to={`/user/info/detail/${line.user.username}`}>
                    <span className="username">{line.user.username}:</span>
                  </NavLink>
                  <span className="comment-text">
                    <AtLine>{line.comment}</AtLine>
                  </span>
                </div>
                {line?.replyTo && (
                  <div className="comment-reply-line">
                    <AtLine>{"@" + line.replyTo.user.username}</AtLine>
                    <AtLine className="reply-message">
                      {line.replyTo.comment}
                    </AtLine>
                  </div>
                )}
                <div className="comment-info-line">
                  <div className="date">{parseDate(line.createdAt)}</div>
                  <div className="media-line">
                    <span
                      className="like"
                      onClick={() => {
                        dispatch(
                          likeComment({ songlist_id, comment_id: line._id })
                        );
                      }}
                    >
                      {Icons.like} <span className="like-num">{line.like}</span>{" "}
                    </span>
                    <span className="share">{Icons.share}</span>
                    <span
                      data-testid={"comment-reply-" + index}
                      className="reply"
                      onClick={() => {
                        setReplyTo({
                          username: line.user.username,
                          comment_id: line._id,
                        });
                      }}
                    >
                      {Icons.message}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {pageNav}
    </div>
  ) : (
    whenEmpty
  );
}
// 单页最大评论个数
const limit = 10;
function Comment({ className, inputBox, setReplyTo, ...props }) {
  const dispatch = useDispatch();
  const { songlist_id } = useParams();
  const commentLines = useSelector(commentLinesSelector);
  const featuredComments = useSelector(featuredCommentsSelector);
  const total = useSelector(songlistDetailSelector).commentLength;
  const offset = useSelector(offsetSelector);

  useEffect(() => {
    dispatch(
      getComment({ songlist_id, offset, limit, isOffline: isOffline() })
    );
  }, [dispatch, songlist_id, offset]);

  return (
    <div className={`comment ${className ? className : ""}`} {...props}>
      <div className="input-box">{inputBox}</div>
      <CommentSection
        title="精彩评论"
        commentLines={featuredComments}
        songlist_id={songlist_id}
        setReplyTo={setReplyTo}
        showPageNav={false}
      />
      <CommentSection
        title="最新评论"
        commentLines={commentLines}
        songlist_id={songlist_id}
        setReplyTo={setReplyTo}
        whenEmpty={<div className="empty-comment">还没有评论，快来抢沙发~</div>}
        pageNav={
          <PageNav
            limit={limit}
            offset={offset}
            setOffset={(offset) => dispatch(setOffset(offset))}
            total={total}
          />
        }
      />
    </div>
  );
}
export function SonglistComment() {
  const [replyTo, setReplyTo] = useState({
    username: undefined,
    comment_id: undefined,
  });
  const { songlist_id } = useParams();
  return (
    <Comment
      className="songlist-comment"
      setReplyTo={setReplyTo}
      inputBox={
        <StaticInputBox
          replyTo={replyTo}
          resetReplyTo={() =>
            setReplyTo({
              username: undefined,
              comment_id: undefined,
            })
          }
          songlist_id={songlist_id}
        />
      }
    />
  );
}
