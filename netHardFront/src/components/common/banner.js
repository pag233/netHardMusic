import React, { useCallback, useEffect, useState } from "react";
import { fetchJSONData } from "./fetch";

import Loading from "./animated/loading";
import NavIcon from "./navIcon";
import { BackEnd } from "./utils";
import "./banner.scss";

//banner轮播intervalId
const intervalIdMap = new Map();

const imageTitleCls = {
  数字专辑: "title-blue",
  首发: "title-red",
  独家: "title-red",
};

export default function Banner() {
  const [bannerList, setBannerList] = useState([]);
  //存放最前端banner index
  const [frontBannerIdx, setFrontBannerIdx] = useState(0);
  const length = bannerList.length;
  //存放banner 圆点icon
  const bannerDots = [];
  const intervalIdSymbol = Symbol("id");
  intervalIdMap.set(intervalIdSymbol, null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchJSONData(BackEnd.address + "/banner", "GET")
      .then((res) => res.json())
      .then((json) => {
        if (mounted) {
          setLoading(false);
          setBannerList(json.banners);
        }
      })
      .catch(console.error);
    return () => (mounted = false);
  }, []);

  const loopBanner = useCallback(() => {
    if (length > 0) {
      const intervalId = intervalIdMap.get(intervalIdSymbol);
      intervalId && clearInterval(intervalId);
      intervalIdMap.set(
        intervalIdSymbol,
        setInterval(() => {
          setFrontBannerIdx((idx) => {
            return idx + 1 > length - 1 ? 0 : idx + 1;
          });
        }, 5000)
      );
    }
  }, [length, intervalIdSymbol]);

  useEffect(() => {
    loopBanner();
    return () => clearInterval(intervalIdMap.get(intervalIdSymbol));
  }, [loopBanner, intervalIdSymbol]);

  return (
    <>
      {loading ? (
        <Loading size={75} />
      ) : (
        <ul
          className="banner-holder"
          onMouseEnter={() =>
            clearInterval(intervalIdMap.get(intervalIdSymbol))
          }
          onMouseLeave={() => {
            loopBanner();
          }}
        >
          {bannerList.map(
            ({ imageUrl, imageTitle, imageId, linkTo }, index) => {
              bannerDots.push(
                <li
                  className={
                    frontBannerIdx === index
                      ? "banner-dot active"
                      : "banner-dot"
                  }
                  key={index}
                  onMouseOver={() => {
                    const intervalId = intervalIdMap.get(intervalIdSymbol);
                    intervalId && clearInterval(intervalId);
                    setFrontBannerIdx(index);
                  }}
                ></li>
              );
              const leftBannerIdx =
                frontBannerIdx - 1 < 0 ? length - 1 : frontBannerIdx - 1;
              const rightBannerIdx =
                frontBannerIdx + 1 > length - 1 ? 0 : frontBannerIdx + 1;
              let bannerCls = null;
              switch (index) {
                case frontBannerIdx:
                  bannerCls = "front";
                  break;
                case leftBannerIdx:
                  bannerCls = "left";
                  break;
                case rightBannerIdx:
                  bannerCls = "right";
                  break;
                default:
                  bannerCls = "back";
                  break;
              }
              return (
                <li className={"banner " + bannerCls} key={imageId} data-testid={`banner-testid`}>
                  <a target="blank" href={linkTo || "https://music.163.com/"}>
                    <img
                      className="banner-image"
                      src={BackEnd.address + "/" + imageUrl}
                      alt={imageTitle}
                    />
                  </a>
                  <div className={"image-title " + imageTitleCls[imageTitle]}>
                    {imageTitle}
                  </div>
                </li>
              );
            }
          )}
          <ul className="banner-dots">{bannerDots}</ul>
          <NavIcon
            className="forward"
            orientation="left"
            data-testid="banner-left"
            size="30px"
            onClick={() => {
              setFrontBannerIdx((idx) => {
                return idx - 1 < 0 ? length - 1 : idx - 1;
              });
            }}
          />
          <NavIcon
            className="backward"
            orientation="right"
            data-testid="banner-right"
            size="30px"
            onClick={() => {
              setFrontBannerIdx((idx) => {
                return idx + 1 > length - 1 ? 0 : idx + 1;
              });
            }}
          />
        </ul>
      )}
    </>
  );
}
