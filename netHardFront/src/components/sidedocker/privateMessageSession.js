import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sideDockerSelector, resetSideDockerSession, setSideDocker } from '../common/reduxStore/uiSlice';

import { BackEnd, parseMessageLineDate } from '../common/utils';
import { Button } from '../common/buttons';
import { fetchData, fetchDataWithToken, fetchJSONData } from '../common/fetch';
import EmojiButton from '../common/emojiButton';
import Icons from '../common/icons';
import Loading from '../common/animated/loading';
import UserAvatar, { LoginUserAvatar } from '../common/user/userAvatar';

import './privateMessageSession.scss';

const keyRoot = process.env.REACT_APP_LOCALSTORAGEROOTKEY;

let lastDate;
const maxTextLength = 200;
export default function MessageSession() {
  const dispatch = useDispatch();
  const textBoxRef = useRef();
  const parentElementRef = useRef();

  const { session } = useSelector(sideDockerSelector);

  const [dataList, setDataList] = useState([]);

  const [loading, setLoading] = useState(true);
  //获取会话信息数据
  useEffect(() => {
    if (session.userId) {
      const url = new URL(BackEnd.address + '/message/privateMessage/data');
      url.searchParams.append('userId', session.userId);
      fetchDataWithToken(fetchData, url, 'GET', {
        keyRoot
      }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.status === 'done') {
          setDataList(jsonRes.data);
        }
        setLoading(false);
      });
    }
  }, [session.userId]);

  //下拉至信息末尾
  useEffect(() => {
    if (!loading && dataList.length > 0) {
      const container = parentElementRef.current;
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [loading, dataList]);

  const textBoxSubmitHandle = useCallback(() => {
    const textBox = textBoxRef.current;
    textBox.value && fetchDataWithToken(fetchJSONData, BackEnd.address + '/message/privateMessage/data', 'POST', {
      body: {
        userId: session.userId,
        message: textBox.value,
      },
      keyRoot
    }).then(res => res.json()).then(jsonRes => {
      if (jsonRes.status === 'done') {
        setDataList(list => [...list, jsonRes.sessionData]);
      }
    });
    textBox.value = '';
  }, [session.userId]);

  //输入的文字的长度
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    return () => {
      dispatch(resetSideDockerSession());
    };
  }, [dispatch]);

  return (
    <div className="sidedocker-message-list-session-holder">
      <div className="sidedocker-message-list-session" ref={parentElementRef}>
        <div className="header-line">
          <div className="back"
            onClick={() => {
              dispatch(setSideDocker({
                children: 'message',
              }));
            }}
          >{Icons.next}</div>
          <div className="username">{session.username}</div>
        </div>
        <div className="message-line-holder">
          {
            loading ?
              <Loading className="message-line-loading" size={75} /> :
              dataList.map(data => {
                //一分钟内的信息不显示发送时间
                let renderDate = true;
                const date = parseMessageLineDate(data.updatedAt);
                if (lastDate === date) {
                  renderDate = false;
                }
                lastDate = date;
                return (
                  <div className={`message-line${session.userId === data.user ? "" : " reverse"}`} key={data._id}>
                    {
                      renderDate && <div className="message-date"><span className="date">{date}</span></div>
                    }
                    {
                      session.userId === data.user ?
                        <UserAvatar className="message-line-avatar" avatar={session.avatarURL && BackEnd.address + session.avatarURL} /> :
                        <LoginUserAvatar className="message-line-avatar" />
                    }
                    <div className="message-pop">
                      {
                        data.message
                      }
                    </div>
                  </div>
                );
              })
          }
        </div>
        <div className="input-area">
          <textarea data-testid="private-session-text-box" ref={textBoxRef} className="text-box" placeholder={`回复 ${session.username}: `} maxLength={maxTextLength}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                textBoxSubmitHandle();
              }
            }}
            onSelect={e => {
              setTextLength(e.target.value.length);
            }}
          ></textarea>
          <span className="textlength">{maxTextLength - textLength}</span>
          <div className="button-section">
            <Button className="input-confirm" type="round"
              onClick={() => {
                textBoxSubmitHandle();
              }}
            >发送</Button>
          </div>
          <EmojiButton
            alignToAnchor="rtl"
            anchorRef={textBoxRef}
            textBoxRef={textBoxRef}
            topOffset={-120}
            leftOffset={-100}
            parentElementRef={parentElementRef}
          />
        </div>
      </div >
    </div>
  );
}