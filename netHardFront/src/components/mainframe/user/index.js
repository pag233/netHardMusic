import FrameFactory from "../../common/FrameFactory";

import Info from "./pages/info";
import InfoEdit from "./pages/edit";

export default function User() {
  const routes = [
    {
      path: "/info/detail/:username",
      component: Info,
      exact: true,
    },
    {
      path: "/info/edit",
      component: InfoEdit,
    },
  ];
  return FrameFactory(routes);
}
