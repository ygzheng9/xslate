import * as React from "react";

import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";

import { Alert, Spin } from "antd";

// 登录界面
import Login from "./components/login/loginForm";

// 主界面
import MarkorLayout from "./components/markor/markorLayout";

import {
  IAppLogin,
  IMarkorAppStates,
  IMarkorUser
} from "./components/collections/types";

import "./App.css";

class MarkorApp extends React.Component<{}, IMarkorAppStates> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // 全局的加载信息
      isLoading: false,
      loadingdescription: "",
      loadingMessage: "",
      loadingTip: "",

      // 用户登录信息，注意：点击浏览器的刷新按钮后，需要重新登录
      isLogin: false,
      user: {} as IMarkorUser,
      token: "",

      // ali-oss 客户端
      client: {}
    };
  }

  // 设置用户登录信息
  public setLoginInfo = ({ isLogin, token, user }: IAppLogin) => {
    this.setState({
      isLogin,
      user,
      token
    });
  };

  // 设置等待信息
  public setLoadingInfo = (
    isLoading: boolean,
    loadingdescription: string,
    loadingTip: string,
    loadingMessage: string
  ) => {
    this.setState({
      isLoading,
      loadingdescription,
      loadingTip,
      loadingMessage
    });
  };

  // login 成功后，需要设置全局的用户信息，
  // 全局用户信息记录在 app 中，需要有回调函数修改；
  public LoginWrapper = (loginProps: any) => () => <Login {...loginProps} />;

  // 判断 登录状态，如果未登录则跳转到 登录界面
  public LoginGuard = (Comp: any, isLogin: boolean) => () => {
    if (isLogin) {
      return <Comp />;
    } else {
      return <Redirect to="/login" />;
    }
  };

  // 显示加载的等待状态
  public loadingInfo = () => {
    const {
      isLoading,
      loadingdescription,
      loadingTip,
      loadingMessage
    } = this.state;

    const loadingTag = isLoading ? (
      <Spin tip={loadingTip}>
        <Alert
          message={loadingMessage}
          description={loadingdescription}
          type="info"
        />
      </Spin>
    ) : (
      ""
    );

    return loadingTag;
  };

  public render() {
    const { isLogin } = this.state;

    const loadingTag = this.loadingInfo();

    const loginProps = {
      setLoginInfo: this.setLoginInfo,
      setLoadingInfo: this.setLoadingInfo
    };

    const layoutProps = {
      setLoadingInfo: this.setLoadingInfo,
      isLogin
    };

    const LoginForm = this.LoginWrapper(loginProps);

    const MarkorLayoutWithProps = () => <MarkorLayout {...layoutProps} />;
    const MarkorMain = this.LoginGuard(MarkorLayoutWithProps, isLogin);

    return (
      <div>
        {loadingTag}

        <Router>
          <Switch>
            <Route exact={true} path="/login" component={LoginForm} />
            <Route path="/markor" component={MarkorMain} />

            <Route component={LoginForm} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default MarkorApp;
