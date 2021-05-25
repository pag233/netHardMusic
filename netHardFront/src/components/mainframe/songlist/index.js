import FrameFactory from "../../common/FrameFactory";

import Detail from "./detail";
import EditInfo from "./editInfo";
export default function Songlist() {
  const routes = [
    {
      path: "/detail/:songlist_id",
      component: Detail,
    },
    {
      path: "/editInfo/:songlist_id",
      component: EditInfo,
    },
  ];
  return FrameFactory(routes);
}
