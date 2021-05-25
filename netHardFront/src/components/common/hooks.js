import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { isLoginSelector } from "./reduxStore/userSlice";

import { escapeRegex } from "./utils";
//未登录自动跳转至默认主页
export function useLoginOnly() {
  const isLogin = useSelector(isLoginSelector);
  const history = useHistory();
  useEffect(() => {
    if (!isLogin) {
      history.replace("/", window.history.state);
    }
  }, [isLogin, history]);
}

//高亮容器内匹配文字
export function useHighLight(
  searchStr,
  containerRef,
  offset = 0,
  highLightItemClass = ".high-light-item"
) {
  const [debounceId, setDebounceId] = useState();
  useEffect(() => {
    if (offset > -1) {
      setDebounceId(
        setTimeout(() => {
          // console.log('debounce fired');
          const listLineHolder = containerRef.current;
          const searchRegExp = new RegExp(
            `(.*)(${escapeRegex(searchStr)})(.*)`,
            "i"
          );
          if (listLineHolder) {
            //listLineHolder子代元素类为highLightItemSelector会被搜索
            const items = listLineHolder.querySelectorAll(highLightItemClass);
            if (searchStr) {
              items.forEach((item) => {
                const result = item.innerText.match(searchRegExp);
                if (result) {
                  const [, prefix, match, suffix] = result;
                  item.innerHTML =
                    prefix +
                    `<span class="high-light">${match}</span>` +
                    suffix;
                } else {
                  item.innerHTML = item.innerText;
                }
              });
            } else {
              items.forEach((item) => {
                item.innerHTML = item.innerText;
              });
            }
          }
        }, 500)
      );
    }
  }, [searchStr, containerRef, highLightItemClass, offset]);
  useEffect(() => {
    return () => {
      // console.log('clear id: ' + debounceId);
      clearTimeout(debounceId);
    };
  }, [debounceId]);
}

export function useForceUpdate() {
  const [state, forceUpdate] = useState(0);
  return [
    state,
    () => {
      forceUpdate((state) => state + 1);
    },
  ];
}
