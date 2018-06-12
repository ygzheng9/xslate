import * as React from "react";

import { connect } from "dva";

import { Alert, Spin } from "antd";

// 登录界面
import Login from "@components/login/loginForm";

// 主界面
import MarkorLayout from "@components/markor/markorLayout";

import "../App.css";

const MarkorApp = (props: any) => {
  const {
    isLogin,
    loadingdescription,
    loadingTip,
    loadingMessage,

    zLoading

    // history
  } = props;

  // 显示加载的等待状态
  const loadingInfo = () => {
    if (zLoading) {
      return (
        <Spin tip={loadingTip}>
          <Alert
            message={loadingMessage}
            description={loadingdescription}
            type="info"
          />
        </Spin>
      );
    }

    return "";
  };

  const loadingInfoTag = loadingInfo();

  const Page = isLogin ? MarkorLayout : Login;

  return (
    <div>
      {loadingInfoTag}
      <Page />
    </div>
  );
};

function mapStateToProps(state: any) {
  return {
    ...state.markorApp
  };
}

export default connect(mapStateToProps)(MarkorApp);
