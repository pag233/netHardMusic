import React, { useEffect, useState } from "react";

import "./processBar.scss";
export default function ProcessBar({
  playing,
  playerRef,
  newTrack,
  setCurrentTimer,
}) {
  const [processPct, setProcessPct] = useState(0);
  useEffect(() => {
    let id;
    if (playing) {
      const player = playerRef.current;
      id = setInterval(() => {
        const playPct = (player.currentTime / player.duration).toFixed(4) * 100;
        setCurrentTimer(player.currentTime);
        setProcessPct(playPct);
      }, 500);
    }
    return () => {
      clearInterval(id);
    };
  }, [playerRef, playing, setCurrentTimer]);

  useEffect(() => {
    if (!newTrack) {
      setProcessPct(0);
    }
  }, [newTrack]);
  return (
    <div className="process-bar">
      <div className="process-bar-background">
        <div
          data-testid="bar"
          className="bar"
          style={{
            width: processPct + "%",
          }}
        >
          <div className="ball"></div>
        </div>
      </div>
      <div
        data-testid="process-bar-click-area"
        className="process-bar-click-area"
        onMouseDown={(e) => {
          const player = playerRef.current;
          if (Number.isNaN(player.duration)) return;

          const clickPct = (
            e.clientX /
            (window.innerWidth || window.document.documentElement.clientWidth)
          ).toFixed(2);
          const processPct = clickPct * 100;
          player.currentTime = player.duration * clickPct;
          setProcessPct(processPct);
        }}
      ></div>
    </div>
  );
}
