import React from "react";

import routeFactory from "../common/RouteFactory";

import Discovery from "./discovery";
import Download from "./download";
import User from "./user";
import Songlist from "./songlist";
import Search from "./search";
import "./mainframe.scss";

export default function MainFrame() {
  const routes = [
    {
      path: "discovery",
      component: Discovery,
    },
    {
      path: "download",
      component: Download,
    },
    {
      path: "user",
      component: User,
    },
    {
      path: "songlist",
      component: Songlist,
    },
    {
      path: "search",
      component: Search,
    },
  ];
  return <div className="main-frame">{routeFactory(routes)}</div>;
}
