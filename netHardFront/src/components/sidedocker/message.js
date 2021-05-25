import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usernameSelector, isLoginSelector } from '../common/reduxStore/userSlice';
import { setOffset } from '../common/reduxStore/commentSlice';
import {
  newMessagesSelector,
  resetNewMessages,
  setNewMessages,
  setSession,
  setSideDocker,
  setSonglistDetailNavType,
} from '../common/reduxStore/uiSlice';
import NavLink from '../common/reduxStore/historyNavLink';

import { BackEnd, parseDate, parseMessageLineDate } from '../common/utils';
import { useForceUpdate } from '../common/hooks';
import { fetchData, fetchDataWithToken } from '../common/fetch';
import { ToggleList } from './togglelist';
import AtLine from '../common/atLine';
import Icons from '../common/icons';
import Loading from '../common/animated/loading';
import StaticInputBox from '../common/staticInputBox';
import UserAvatar from '../common/user/userAvatar';
import './message.scss';

const keyRoot = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const fetchLength = 10;

function SideDockerLoading() {
  return <Loading size={75} className="sidedocker-message-loading" />;
}

function Message() {
  const dispatch = useDispatch();
  const isLogin = useSelector(isLoginSelector);
  const [loading, setLoading] = useState(isLogin);
  const [messageList, setMessageList] = useState([]);
  // 获取会话数据
  useEffect(() => {
    let mounted = true;
    if (isLogin) {
      fetchDataWithToken(fetchData, BackEnd.address + '/message/privateMessage', 'GET', {
        keyRoot
      }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.status === 'done' && mounted) {
          setMessageList(jsonRes.privateMessageList);
          dispatch(setNewMessages({
            newMessages: {
              privateMessage: 0,
            }
          }));
        }
        setLoading(false);
      });
    }
    return () => mounted = false;
  }, [dispatch, isLogin]);

  return (
    <ul className="sidedocker-message-list">
      {
        loading ? <SideDockerLoading /> : (messageList.length > 0 ?
          messageList.map(msgList => (
            <li className="message" key={msgList._id}
              onClick={() => {
                dispatch(setSideDocker({
                  children: 'session',
                  show: true
                }));
                dispatch(setSession({
                  session: {
                    avatarURL: msgList.talkingTo.avatarURL,
                    userId: msgList.talkingTo._id,
                    username: msgList.talkingTo.username,
                  }
                }));
              }}
            >
              {
                msgList.newMessage > 0 &&
                <div className="new-message">•</div>
              }
              <div className="avatar-holder">
                <UserAvatar className="message-avatar" avatar={msgList.talkingTo.avatarURL && BackEnd.address + msgList.talkingTo.avatarURL} />
              </div>
              <div className="message-text" data-testid="message-text">
                <span className="message-date">{parseDate(msgList.dataRef.lastMessage.updatedAt)}</span>
                <span className="message-user">{msgList.talkingTo.username}</span>
                <span className="message-msg">{msgList.dataRef.lastMessage.message}</span>
              </div>
            </li>
          )) :
          <div className="no-message">暂无私信</div>
        )
      }
    </ul>
  );
}

function CommentMap({
  comments,
  dispatch,
  InputBox,
  replyTo,
  setReplyTo,
}) {
  return (
    comments.map((comment, key) => (
      <div key={comment._id} className="comment-list-item">
        <div className="comment-list-info">
          <NavLink to={`/user/info/detail/${comment.user.username}`}>
            <UserAvatar className="user-avatar" avatar={comment.user.avatarURL && BackEnd.address + comment.user.avatarURL} />
          </NavLink>
          <div className="comment-detail">
            <div className="comment-date">{parseMessageLineDate(comment.createdAt)}</div>
            <NavLink to={`/user/info/detail/${comment.user.username}`}>
              <div className="comment-username">{comment.user.username}</div>
            </NavLink>
            <div className="comment-message">
              {
                comment.replyTo?.user &&
                <div className="reply-user">
                  <AtLine className="comment-username">
                    {"回复" + comment.replyTo.user.username + ":"}
                  </AtLine>
                </div>
              }
              <AtLine>
                {comment.comment}
              </AtLine>
            </div>
            {
              comment.songlist &&
              <NavLink to={`/songlist/detail/${comment.songlist._id}`}
                onClick={() => {
                  dispatch(setSonglistDetailNavType('comment'));
                  dispatch(setOffset(comment.songlist.offset));
                }}>
                <div className="comment-reply-to">
                  {
                    comment.replyTo ?
                      comment.replyTo.user.username + '的评论：' + comment.replyTo.comment :
                      '我的：⌜' + comment.songlist.name + '⌟'
                  }
                </div>
              </NavLink>
            }
            <div className="reply"
              onClick={() => {
                key = replyTo.key === key ? -1 : key;
                setReplyTo({
                  key,
                  comment_id: comment._id,
                  songlist_id: comment.songlist._id,
                  username: comment.user.username,
                });
              }}
            >
              {Icons.message}回复
                        </div>
          </div>
        </div>
        {InputBox(key)}
      </div>
    ))
  );
}

function AtMap({
  comments,
  dispatch,
  InputBox,
  replyTo,
  setReplyTo,
}) {
  const username = useSelector(usernameSelector);
  return (
    comments.map((atComment, key) => (
      <div key={atComment._id} className="comment-list-item">
        <div className="comment-list-info">
          <UserAvatar className="user-avatar" avatar={atComment.comments.user.avatarURL && BackEnd.address + atComment.comments.user.avatarURL} />
          <div className="comment-detail">
            <div className="comment-date">{atComment.comments.createAt}</div>
            <div className="comment-username">{atComment.comments.user.username}</div>
            <div className="comment-message">
              评论:
                        <span className="comment-username">
                <NavLink to={`/user/info/detail/${username}`}>
                  @{username}
                </NavLink>
              </span>
              <AtLine>
                {atComment.comments.comment}
              </AtLine>
            </div>
            <NavLink to={`/songlist/detail/${atComment.songlist._id}`}
              onClick={() => {
                dispatch(setSonglistDetailNavType('comment'));
                dispatch(setOffset(atComment.songlist.offset));
              }}
            >
              <div className="comment-reply-to">
                {
                  atComment.songlist.coverURL ?
                    <img className="cover" src={BackEnd.address + atComment.songlist.coverURL} alt="" /> :
                    Icons.music
                }
                <div className="songlist-name">
                  <span className="songlist-icon">歌单</span>
                  {atComment.songlist.name}
                  <div className="songlist-by">
                    by {atComment.songlist.by.username}
                  </div>
                </div>
              </div>
            </NavLink>
            <div className="reply"
              onClick={() => {
                key = replyTo.key === key ? -1 : key;
                setReplyTo({
                  key,
                  comment_id: atComment.comments._id,
                  songlist_id: atComment.songlist._id,
                  username: atComment.comments.user.username,
                });
              }}
            >
              {Icons.message}回复
                        </div>
          </div>
        </div>
        {InputBox(key)}
      </div>
    ))
  );
}

const messageTypeToApiPoint = {
  comment: {
    apiPoint: '/message/commentMessage',
    noMessage: '评论'
  },
  at: {
    apiPoint: '/message/atMessage',
    noMessage: '@我的'
  }
};
function Comment({
  MessageMap,
  messageType,
}) {
  const dispatch = useDispatch();
  const isLogin = useSelector(isLoginSelector);

  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(isLogin);

  const [fetchOffset, setFetchOffset] = useState(0);

  const hasMore = comments.length > 0 && comments[comments.length - 1].end !== true;

  const [dockerScrollTop, setDockerScrollTop] = useState(0);

  const [forceUpdateState, forceUpdate] = useForceUpdate();

  const [replyTo, setReplyTo] = useState({
    comment_id: undefined,
    key: -1,
    songlist_id: undefined,
    username: undefined,
  });

  useEffect(() => {
    if (forceUpdateState > 0) {
      setFetchOffset(0);
    }
  }, [forceUpdateState]);

  useEffect(() => {
    if (!loading) {
      document.getElementById('side-docker').scrollTop = dockerScrollTop;
    }
  }, [loading, dockerScrollTop]);

  useEffect(() => {
    let mounted = true;
    if (isLogin) {
      const url = new URL(BackEnd.address + messageTypeToApiPoint[messageType].apiPoint);
      url.searchParams.append('offset', fetchOffset);
      fetchDataWithToken(fetchData, url, 'GET', {
        keyRoot
      }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.status === 'done' && mounted) {
          if (forceUpdateState > 0) {
            setComments(jsonRes.message);
          } else {
            setComments(comments => [...comments, ...jsonRes.message]);
          }
          dispatch(setNewMessages({
            newMessages: {
              messageType: 0
            }
          }));
          setLoading(false);
        }
      });
    }
    return () => mounted = false;
  }, [dispatch, fetchOffset, forceUpdateState, messageType, isLogin]);

  return (
    loading ? <SideDockerLoading /> :
      <div className="sidedocker-comment-at-list">
        {
          comments.length > 0 ?
            <MessageMap
              comments={comments}
              dispatch={dispatch}
              forceUpdate={forceUpdate}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              InputBox={key => (replyTo.key === key &&
                <StaticInputBox
                  afterPost={forceUpdate}
                  className="sidebar-comment-input-box"
                  replyTo={replyTo}
                  songlist_id={replyTo.songlist_id}
                  resetReplyTo={() =>
                    setReplyTo({
                      comment_id: undefined,
                      key: -1,
                      songlist_id: undefined,
                    })}
                />)}
            /> :
            <div className="no-message">暂无{messageTypeToApiPoint[messageType].noMessage}消息</div>
        }
        {
          hasMore &&
          <div className="load-more"
            onClick={() => {
              setLoading(true);
              setFetchOffset(offset => offset + fetchLength);
              setDockerScrollTop(document.getElementById('side-docker').scrollTop);
            }}
          >加载更多评论</div>
        }
      </div>
  );
}

export default function MessageList() {
  const dispatch = useDispatch();

  const [currentList, setCurrentList] = useState('message');

  const newMessages = useSelector(newMessagesSelector);

  const [canReadAll, setCanReadAll] = useState(false);

  useEffect(() => {
    for (const messageType in newMessages) {
      if (newMessages[messageType] > 0) {
        setCanReadAll(true);
      }
    }
  }, [newMessages]);

  return (
    <div className="message-list-holder">
      <div className="title">
        <span className={`all-readed${canReadAll ? " all-readed-enable" : ""}`}
          onClick={() => {
            canReadAll && fetchDataWithToken(fetchData, BackEnd.address + '/message/all', 'GET', {
              keyRoot
            }).then(() => {
              dispatch(resetNewMessages());
              setCanReadAll(false);
            });
          }}
        >一键已读</span>
        <h2 className="header">消息</h2>
      </div>
      <ToggleList
        className="message-toggle-list"
        currentList={currentList}
        setCurrentList={setCurrentList}
        width={320}
        toggleButtons={[
          {
            target: "message",
            text: '私信',
            newMessage: newMessages.privateMessage
          },
          {
            target: "comment",
            text: '评论',
            newMessage: newMessages.comment

          },
          {
            target: "at",
            text: '@我',
            newMessage: newMessages.at
          },
          {
            target: "notice",
            text: '通知',
            newMessage: newMessages.notice
          },
        ]}>
      </ToggleList>
      {
        currentList === 'message' &&
        <Message />
      }
      {
        currentList === 'comment' &&
        <Comment MessageMap={CommentMap} messageType={currentList} />
      }
      {
        currentList === 'at' &&
        <Comment MessageMap={AtMap} messageType={currentList} />
      }
      {
        currentList === 'notice' &&
        <div className="no-message">未实现通知消息</div>
      }
    </div>
  );
}