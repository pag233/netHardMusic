import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  postComment,
} from './reduxStore/commentSlice';
import { setInfoMessager } from './reduxStore/uiSlice';

import { Button } from './buttons';
import { fetchData } from './fetch';
import { FixedPopup } from './popup';
import EmojiButton from './emojiButton';
import { BackEnd } from './utils';

import './staticInputBox.scss';

export default function StaticInputBox({
  afterPost,
  className,
  maxLength = 140,
  replyTo,
  resetReplyTo,
  songlist_id,
}) {
  const dispatch = useDispatch();
  const textBoxRef = useRef();
  const [textLength, setTextLength] = useState(0);
  /**
   * textarea中有一div与该textarea外观，行为完全一致的即大小、内容、位置、字体、字体起始、字体间距、行间距一致且不可见的元素，称为shadow div
      当点击@或话题按钮时shadow div中有一空span将成为锚点元素，用于将弹框定位至输入位置，span元素id为shadow-anchor-point
      目前潜在问题有两点：
      1、因定位问题，滚动时弹窗将同屏滚动。遂滚动时取消弹窗显示(解决思路：1，可将弹窗移动至顶层，修改其position absolute，2、滚动时修改其top）。
      2、当客户端无法统一shadow div，与textarea的字体时，将可能导致定位错误，可依赖网络字体解决或客户端安装字体解决。
   */
  const shadowRef = useRef();
  const shadowAnchorId = 'shadow-anchor-point';

  const [atLines, setAtLines] = useState([]);
  const [atFilterText, setAtFilterText] = useState('');
  const filtedAtLines = atLines.filter(line => line.includes(atFilterText));

  const [hashLines, setHashLines] = useState([]);
  const [lastInsertHashIndex, setLastInsertHashIndex] = useState(0);

  const [showAtPopup, setShowAtPopup] = useState(false);
  const [atComplete, setAtComplete] = useState(false);

  const [showHashPopup, setShowHashPopup] = useState(false);

  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0
  });
  const [TextBoxContext, setTextBoxContext] = useState({
    show: false,
    context: {
      hasText: false
    },
    position: {
      x: 0,
      y: 0
    }
  });
  useEffect(() => {
    let mounted = true;
    fetchData(BackEnd.address + '/topics').then(async res => {
      if (mounted) {
        const jsonRes = await res.json();
        if (jsonRes.status === 'done') {
          return setHashLines(
            jsonRes.topics
          );
        }
        throw new Error(jsonRes.error);
      }
    });
    //fake
    setAtLines(
      [
        "网易云音乐",
        "云音乐小秘书",
      ]
    );
    return () => mounted = false;
  }, []);

  useEffect(() => {
    if (atComplete) {
      setShowAtPopup(false);
    }
  }, [atComplete]);

  useEffect(() => {
    const shadowAnchor = document.getElementById(shadowAnchorId);
    const rect = shadowAnchor.getBoundingClientRect();
    setPopupPosition({
      left: rect.left,
      top: rect.bottom
    });
  }, []);

  useEffect(() => {
    const HidePopupWhenScroll = () => {
      setShowAtPopup(false);
      setShowHashPopup(false);
    };
    const mainBody = document.getElementById('main-body');
    mainBody.addEventListener('scroll', HidePopupWhenScroll);
    return () => mainBody.removeEventListener('scroll', HidePopupWhenScroll);
  }, []);

  useEffect(() => {
    if (replyTo?.username) {
      const textBox = textBoxRef.current;
      textBox.value = `回复${replyTo.username}：`;
      textBox.focus();
    }
  }, [replyTo]);


  const onSubmitHandle = () => {
    const textBox = textBoxRef.current;
    const { value } = textBox;
    let replyTextEmpty = false;
    let isReplyTo = false;
    let replyText = value;
    if (replyTo?.username) {
      const preReplyText = `回复${replyTo.username}：`;
      isReplyTo = value.indexOf(preReplyText) === 0;
      replyText = value.slice(preReplyText.length);
      replyTextEmpty = replyText === '';
    }
    if (value.trim() === '' || replyTextEmpty) {
      return dispatch(setInfoMessager({
        show: true,
        loading: false,
        content: {
          status: 'error',
          message: '写点东西吧，内容不能为空',
        }
      }));
    }
    dispatch(postComment({ songlist_id, comment: replyText, replyTo_id: isReplyTo ? replyTo.comment_id : undefined }))
      .then(() => {
        typeof afterPost === 'function' && afterPost();
      });
    resetReplyTo();
    textBox.value = '';
  };

  return (
    <div className={"static-input-box" + (className ? " " + className : "")}>
      <textarea data-testid="static-textarea" ref={textBoxRef} className="static-textarea" placeholder="输入评论或@朋友" maxLength={maxLength}
        name="" id="" cols="30" rows="10"
        onChange={e => {
          setTextLength(e.target.value.length ?? 0);
        }}
        onSelect={e => {
          const { value, selectionStart: cursorPosition } = e.target;
          // console.log(cursorPosition);
          //光标锚点元素
          const shadowBox = shadowRef.current;
          shadowBox.innerHTML = value.slice(0, cursorPosition) + `<div id="${shadowAnchorId}"></div>` + value.slice(cursorPosition);
          //因采用非控制input元素所以在此设置文字长度
          setTextLength(e.target.value.length ?? 0);
          const shadowAnchor = document.getElementById(shadowAnchorId);
          const rect = shadowAnchor.getBoundingClientRect();
          setPopupPosition({
            left: rect.left,
            top: rect.bottom
          });
          //控制输入@时的输入提示
          const textBeforeCursor = value.slice(0, cursorPosition);
          const lastAtIndex = textBeforeCursor.lastIndexOf('@');
          if (lastAtIndex > -1 && lastAtIndex < cursorPosition) {
            const textBetweenAt = value.slice(lastAtIndex, cursorPosition);
            setAtFilterText(textBetweenAt.slice(1));
            if (textBetweenAt.includes(' ')) {
              setAtComplete(true);
            } else {
              setAtComplete(false);
              setShowAtPopup(true);
            }
          } else {
            setShowAtPopup(false);
          }
          //控制输入#时的提示
          const lastHashIndex = textBeforeCursor.lastIndexOf('#');
          if (cursorPosition <= lastInsertHashIndex) {
            return setShowHashPopup(false);
          }
          if (lastHashIndex > -1 && lastHashIndex < cursorPosition) {
            const textBetweenHash = value.slice(lastHashIndex + 1, cursorPosition);
            if (textBetweenHash.includes(' ')) {
              setShowHashPopup(false);
            } else {
              setShowHashPopup(true);
            }
          }
        }}
        onKeyDown={e => {
          const { value, selectionStart: cursorPosition } = e.target;
          switch (e.key) {
            case "Process":
              e.shiftKey && setLastInsertHashIndex(cursorPosition);
              break;
            case '#':
              setLastInsertHashIndex(cursorPosition);
              break;
            case 'Escape':
              setShowAtPopup(false);
              setShowHashPopup(false);
              break;
            case 'Backspace':
              //处理@删除时的行为
              const textBeforeCursor = value.slice(0, cursorPosition);
              const lastAtIndex = textBeforeCursor.lastIndexOf('@');
              if (lastAtIndex > -1) {
                const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
                if (cursorPosition === lastSpaceIndex + 1) {
                  e.target.setRangeText('', lastAtIndex, lastSpaceIndex + 1);
                  return e.preventDefault();
                }
                const textAfterCursor = value.slice(cursorPosition);
                const spaceAfterCursor = textAfterCursor.indexOf(' ');
                if (spaceAfterCursor > -1) {
                  e.target.setRangeText('', lastAtIndex, cursorPosition + spaceAfterCursor + 1);
                  return e.preventDefault();
                }
              }
              break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Enter':
              onSubmitHandle();
              e.preventDefault();
              break;
            default:
              break;
          }

        }}
        onContextMenu={e => {
          const textBox = textBoxRef.current;
          setTextBoxContext({
            show: true,
            context: {
              hasText: textBox.value ? true : false
            },
            position: {
              top: e.clientY,
              left: e.clientX
            }
          });
        }}
      ></textarea>
      {
        TextBoxContext.show &&
        <FixedPopup closePopup={() => setTextBoxContext({ show: false })} position={TextBoxContext.position}>
          <div className="textbox-context">
            <button className='context-item'
              disabled={!TextBoxContext.context.hasText ? true : false}
              onClick={() => {
                const textBox = textBoxRef.current;
                navigator.clipboard.writeText(textBox.value.slice(textBox.selectionStart, textBox.selectionEnd));
                textBox.setRangeText('', textBox.selectionStart, textBox.selectionEnd, 'end');
                setTextBoxContext({ show: false });
                textBox.focus();
              }}>剪切</button>
            <button className='context-item'
              disabled={!TextBoxContext.context.hasText}
              onClick={() => {
                const textBox = textBoxRef.current;
                navigator.clipboard.writeText(textBox.value.slice(textBox.selectionStart, textBox.selectionEnd));
                setTextBoxContext({ show: false });
                textBox.focus();
              }}
            >复制</button>
            <button className='context-item'
              onClick={() => {
                const textBox = textBoxRef.current;
                navigator.clipboard.readText().then(text => {
                  text && textBox.setRangeText(text, textBox.selectionStart, textBox.selectionEnd, 'end');
                  setTextBoxContext({ show: false });
                  textBox.focus();
                });
              }}
            >粘贴</button>
            <button className='context-item'
              disabled={!TextBoxContext.context.hasText}
              onClick={() => {
                const textBox = textBoxRef.current;
                textBox.setRangeText('', textBox.selectionStart, textBox.selectionEnd, 'end');
                setTextBoxContext({ show: false });
                textBox.focus();
              }}
            >删除</button>
            <button className='context-item'
              disabled={!TextBoxContext.context.hasText}
              onClick={() => {
                const textBox = textBoxRef.current;
                textBox.setSelectionRange(0, textBox.value.length, 'forward');
                setTextBoxContext({ show: false });
                textBox.focus();
              }}
            >全选</button>
          </div>
        </FixedPopup>
      }
      <div ref={shadowRef} className='shadow-for-locate'>
        <div id={shadowAnchorId}></div>
      </div>
      <span className="char-count-left">{maxLength - textLength}</span>
      <div className="comment-buttons-section">
        <div className="social-media-features">
          <EmojiButton textBoxRef={textBoxRef} />
          <span className="feature-button at-button"
            onClick={() => {
              const textBox = textBoxRef.current;
              textBox.setRangeText('@', textBox.selectionStart, textBox.selectionEnd, 'end');
              textBox.focus();
              setShowAtPopup(true);
            }}
          >
            @
                    </span>
          <span className="feature-button hash-button"
            onClick={() => {
              const textBox = textBoxRef.current;
              textBox.setRangeText('#选择您想要的话题#', textBox.selectionStart, textBox.selectionEnd, 'select');
              setLastInsertHashIndex(textBox.selectionStart);
              textBox.selectionStart++;
              textBox.selectionEnd--;
              textBox.focus();
              setShowHashPopup(true);
            }}
          >
            #
                    </span>
          {
            showAtPopup &&
            <FixedPopup anchorId={shadowAnchorId} className="media-popup"
              closePopup={() => {
                setShowAtPopup(false);
              }}
              position={{
                left: popupPosition.left,
                top: popupPosition.top
              }}
            >
              {
                filtedAtLines.length > 0 && <div className="line-title">请选择@的人或直接输入</div>
              }
              {
                !atComplete &&
                <div className="line-title">按空格确认输入</div>
              }
              {
                filtedAtLines.map((line, key) => (
                  <div key={key} className="media-line"
                    onClick={() => {
                      const textBox = textBoxRef.current;
                      const { value, selectionStart: cursorPosition } = textBox;
                      const textBeforeCursor = value.slice(0, cursorPosition);
                      const AtIndex = textBeforeCursor.lastIndexOf('@');
                      textBox.setRangeText('@' + line + ' ', AtIndex, textBox.selectionEnd, 'end');
                      textBox.focus();
                      setShowAtPopup(false);
                    }}
                  >{line}</div>
                ))
              }
            </FixedPopup>
          }
          {
            showHashPopup &&
            <FixedPopup anchorId={shadowAnchorId} className="media-popup"
              closePopup={() => {
                setShowHashPopup(false);
              }}
              position={{
                left: popupPosition.left,
                top: popupPosition.top
              }}
            >
              <div className="line-title">为您推荐</div>
              {
                hashLines.map((line, key) => (
                  <div key={key} className="media-line"
                    onClick={() => {
                      const textBox = textBoxRef.current;
                      textBox.setRangeText('#' + line + '# ', textBox.selectionStart - 1, textBox.selectionEnd + 1, 'end');
                      textBox.focus();
                      setShowHashPopup(false);
                    }}
                  >{'#' + line + '#'}</div>
                ))
              }
            </FixedPopup>
          }
        </div>
        <Button className="comment-confirm-button"
          onClick={() => {
            onSubmitHandle();
          }}
        >评论</Button>
      </div>
    </div >
  );
}