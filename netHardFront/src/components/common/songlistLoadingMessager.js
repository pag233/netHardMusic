import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { infoMessagerSelector, setInfoMessager } from "./reduxStore/uiSlice";
import Loading from "./animated/loading";
import Icons from "./icons";
import "./songlistLoadingMessager.scss";

const fadeoutDuration = 1000;

export default function SonglistInfoMessager() {
  const dispatch = useDispatch();
  const { show, content, loading, fadeOutDelay } = useSelector(
    infoMessagerSelector
  );
  const [showMessager, setShowMessager] = useState(false);
  useEffect(() => {
    let id;
    if (show) {
      setShowMessager(true);
      if (!loading) {
        id = setTimeout(() => {
          setShowMessager(false);
          dispatch(
            setInfoMessager({
              show: false,
            })
          );
        }, fadeOutDelay);
      }
    } else {
      id = setTimeout(() => {
        setShowMessager(false);
      }, fadeOutDelay);
    }
    return () => clearTimeout(id);
  }, [show, loading, dispatch, setShowMessager, fadeOutDelay]);

  return (
    showMessager && (
      <div
        className="messager"
        style={{
          animationDuration: fadeoutDuration / 1000 + "s",
          animationDelay: (fadeOutDelay - fadeoutDuration) / 1000 + "s",
        }}
      >
        {show && loading ? (
          <div className="loading-animation">
            {/* status = 'done' || 'error' */}
            {Icons[content.status]}
            <Loading className="messager-loading" size={35} showText={false} />
          </div>
        ) : (
          <div className="loading-message">
            {Icons[content.status]}
            <span className="message">{" " + content.message}</span>
          </div>
        )}
      </div>
    )
  );
}
