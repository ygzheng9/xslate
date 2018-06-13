import * as React from "react";

import { connect } from "dva";

import { Alert, Spin } from "antd";

import axios, { AxiosResponse } from "axios";

import { message } from "antd";

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

    logout

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

  // Add a response interceptor
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

function mapDispatchToProps(dispatch: any) {
  return {
    logout: () => dispatch({ type: "markorApp/logout" })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MarkorApp);
