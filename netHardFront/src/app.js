import React, { useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";

import { useSelector } from "react-redux";
import { sideDockerSelector } from "./components/common/reduxStore/uiSlice";

import MainFrame from "./components/mainframe";
import SideBar from "./components/sidebar";
import Footer from "./components/footer";
import SideDocker from "./components/sidedocker";

import "./app.scss";

function App() {
  const theme = useSelector((state) => state.theme.current);
  const loading = useSelector((state) => state.user.loading);
  const docker = useSelector(sideDockerSelector);

  useEffect(() => {
    document.title = "netHardMusic";
  }, []);

  return (
    <div className="app">
      <div className={theme}>
        <div
          id="container"
          className="container"
          onClickCapture={(e) => {
            //加载时停止响应点击事件
            if (loading) {
              return e.preventDefault();
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Router>
            <SideBar />
            <MainFrame />
            <Footer />
            {docker.show && <SideDocker />}
          </Router>
        </div>
      </div>
    </div>
  );
}

export default App;
