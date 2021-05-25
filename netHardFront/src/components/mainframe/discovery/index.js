import frameFactory from "../../common/FrameFactory";

import Recommend from "./pages/recommend";
import Playlist from "./pages/songlist";
import Billboard from "./pages/billboard";
import Artist from "./pages/artist";
import Fresh from "./pages/fresh";

export default function Discovery() {
  const routes = [
    {
      path: "/recommend",
      name: "个性推荐",
      component: Recommend,
    },
    {
      path: "/playlist",
      name: "歌单",
      component: Playlist,
    },
    {
      path: "/billboard",
      name: "排行榜",
      component: Billboard,
    },
    {
      path: "/artist",
      name: "歌手",
      component: Artist,
    },
    {
      path: "/fresh",
      name: "最新音乐",
      component: Fresh,
    },
  ];
  return frameFactory(routes);
}
