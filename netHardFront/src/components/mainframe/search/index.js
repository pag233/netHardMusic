import FrameFactory from "../../common/FrameFactory";

import Result from "./pages/search";

export default function Search() {
  const routes = [
    {
      path: "/result/:path/:query",
      component: Result,
      // exact: true
    },
  ];
  return FrameFactory(routes);
}
