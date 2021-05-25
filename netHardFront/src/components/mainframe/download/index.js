import frameFactory from "../../common/FrameFactory";

import Finished from "./pages/finished";
import Loading from "./pages/loading";

export default function Download() {
  const routes = [
    {
      path: "/finished",
      name: "已下载",
      component: Finished,
    },
    {
      path: "/loading",
      name: "正在下载",
      component: Loading,
    },
  ];
  return frameFactory(routes);
}
