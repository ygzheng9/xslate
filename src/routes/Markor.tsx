import * as React from "react";

import { connect } from "dva";

import { Redirect, Route, Router, Switch } from "dva/router";

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

    zLoading,

    history
  } = props;

  // 判断 登录状态，如果未登录则跳转到 登录界面
  const LoginGuard = (Comp: any) => () => {
    if (isLogin) {
      return <Comp />;
    } else {
      return <Redirect to="/login" />;
    }
  };

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

  const MarkorMain = LoginGuard(MarkorLayout);

  return (
    <div>
      {loadingInfoTag}
      <Router history={history}>
        <Switch>
          <Route exact={true} path="/login" component={Login} />
          <Route path="/markor" component={MarkorMain} />

          <Route component={Login} />
        </Switch>
      </Router>
    </div>
  );
};

function mapStateToProps(state: any) {
  return {
    ...state.markorApp
  };
}

export default connect(mapStateToProps)(MarkorApp);
