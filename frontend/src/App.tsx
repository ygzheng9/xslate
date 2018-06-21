import * as React from "react";

import { connect } from "dva";
import { Link, Redirect, withRouter } from "dva/router";

import { RouteProps } from "react-router";

import { Alert, Layout, Menu, message, Spin } from "antd";
import axios, { AxiosResponse } from "axios";

import appConfig from "@config/app";
import { IGlobalState, MainModel, ZDispatch } from "@models/types";

const { Header, Content, Footer } = Layout;

import "./App.css";

type AppProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteProps;

// 这里面只是框架，真正页面上看到的是，渲染的子元素 children
const App: React.SFC<AppProps> = props => {
  const {
    isLogin,

    zLoading,
    loadingdescription,
    loadingTip,
    loadingMessage,

    user,

    logout,

    children,
    location
  } = props;
  // axios 拦截器
  // TODO: 先判断是有已经有 interceptor 了，如果没有，再增加，如果有了，那就什么都不做；
  axios.interceptors.response.use(
    (response: AxiosResponse<any>) => {
      // console.log("res: ", response);

      // 本地 API返回
      const { rtnCode } = response.data;
      if (rtnCode !== null && rtnCode !== undefined && rtnCode !== 0) {
        message.error("网络故障，错误代码 800002，请稍后重试");
        return response;
      }

      // markor api 返回
      const { errors } = response.data;
      if (
        errors !== null &&
        errors !== undefined &&
        errors[0].statusMessage !== "SUCCESS"
      ) {
        message.error("身份验证已过期，请重新登录");

        logout();

        return Promise.reject();
      }

      return response;
    },
    error => {
      message.error("网络故障，错误代码 800003，请稍后重试");
      console.log("error: ", error);

      // Do something with response error
      return Promise.reject(error);
    }
  );

  // 如果是 登录界面，不需要 layout
  if (location === undefined) {
    return <div>{children}</div>;
  }

  let { pathname } = location;
  // console.log("pathname: ", pathname);
  pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // console.log("pathname2: ", pathname);
  const topWnds = ["/login", "/changePass"];
  const idx = topWnds.indexOf(pathname);
  if (idx >= 0) {
    console.log("login page.");
    return <div>{children}</div>;
  }

  // 校验用户：如果没有登录，跳转到登录界面
  if (!isLogin) {
    // console.log("not login.");
    return <Redirect to="/login" />;
  }

  // 如果是 非登录界面，有 layout
  // 显示全局的 loading 信息
  const LoadingInfo = () => {
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

    return <div />;
  };

  return (
    <div>
      <LoadingInfo />
      <Layout>
        <Header
          style={{ padding: 0, position: "fixed", zIndex: 1, width: "100%" }}
        >
          <div className="layoutLogo">
            <img style={{ width: 100, height: 30 }} src={appConfig.loginPic} />
          </div>

          <div className="logout">
            {`${user.username}    `}
            <a onClick={logout}>退出</a>
          </div>

          <Menu theme="light" mode="horizontal" style={{ lineHeight: "64px" }}>
            <Menu.Item key="11">
              <Link to={`/threads`}>数据库</Link>
            </Menu.Item>
            <Menu.Item key="12">
              <Link to={`/products`}>备选商品</Link>
            </Menu.Item>
            <Menu.Item key="21">
              <Link to={`/todos`}>待办列表</Link>
            </Menu.Item>
            <Menu.Item key="22">
              <Link to={`/events`}>商品计划</Link>
            </Menu.Item>
            <Menu.Item key="90">
              <Link to={`/users`}>用户清单</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 64 }}>
          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>{appConfig.footer}</Footer>
      </Layout>
    </div>
  );
};

function mapStateToProps(state: IGlobalState) {
  return {
    ...state[MainModel]
  };
}

function mapDispatchToProps(dispatch: ZDispatch) {
  return {
    logout: () => dispatch({ type: "main/logout" })
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
