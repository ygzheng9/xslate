import * as React from "react";

import { withRouter } from "react-router-dom";

import { Button, Form, Input, message, Row } from "antd";

import axios from "axios";

import {
  IAPILoginInfo,
  IAPIRtnObject,
  IAppLogin,
  IMarkorUser
} from "../collections/types";

import "./loginForm.css";

const FormItem = Form.Item;

// interface ILoginFormProps {
//   setLoginInfo: (i: IMarkorAppStates) => void;
// }

interface ILoginFormStates {
  // isLoading: boolean;
  loginSuccess: boolean;
}

// LoginForm 是 connect 到 redux 中，取里面的 app 数据
class LoginForm extends React.Component<any, ILoginFormStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      loginSuccess: false
    };
  }

  public toMainPage = () => {
    this.setState({
      loginSuccess: true
    });
  };

  public handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      setLoginInfo,
      setLoadingInfo,
      history
    } = this.props;

    // const toMainPage = this.toMainPage;

    validateFieldsAndScroll((errors: any, values: any) => {
      if (errors) {
        message.error("登录失败，请重试");
        return;
      }

      const loginUrl = "/Markor/adapters/Employee/login";

      // 替换成界面输入的用户名和密码
      const loginParam: IMarkorUser = {
        ...values
      };
      console.log("loginParam: ", loginParam);

      // 设置等待状态
      setLoadingInfo(true, "请稍后", "准备中", "正在获取您的基本信息.....");

      axios.post(loginUrl, loginParam).then(res => {
        const data: IAPIRtnObject = res.data as IAPIRtnObject;

        if (data.errors[0].statusMessage !== "SUCCESS") {
          message.error("用户名或密码错误，请重试");
        } else {
          const loginInfo = res.data.content[0] as IAPILoginInfo;
          const token = loginInfo.token;

          const info: IAppLogin = {
            isLogin: true,
            user: loginParam,
            token
          };

          setLoginInfo(info);

          // 全局设置
          axios.defaults.headers.common.Authorization = token;

          message.success("登录成功");

          // 跳转页面
          history.push("/markor");
          // toMainPage();

          setLoadingInfo(false);
        }
      });
    });
  };

  public render() {
    // const { loginSuccess } = this.state;
    // if (loginSuccess) {
    //   return <Redirect to="/markor" />;
    // }

    const {
      form: { getFieldDecorator },
      loginLoading
    } = this.props;

    const handleOk = this.handleOk;

    return (
      <div>
        <div className="form">
          <div className="logo">
            <img alt={"logo"} src={"/pic/MHF.png"} />
            <span>{"环球笔记"}</span>
          </div>
          <form>
            <FormItem hasFeedback={true}>
              {getFieldDecorator("username", {
                rules: [
                  {
                    required: true
                  }
                ]
              })(<Input onPressEnter={handleOk} placeholder="username" />)}
            </FormItem>
            <FormItem hasFeedback={true}>
              {getFieldDecorator("password", {
                rules: [
                  {
                    required: true
                  }
                ]
              })(
                <Input
                  type="password"
                  onPressEnter={handleOk}
                  placeholder="password"
                />
              )}
            </FormItem>
            <Row>
              <Button type="primary" onClick={handleOk} loading={loginLoading}>
                登录
              </Button>
              <p>
                <span>用户名：ibmtest</span>
                <span>密码：Mhf0131</span>
              </p>
            </Row>
          </form>
        </div>
      </div>
    );
  }
}

const LoginForm2 = Form.create()(LoginForm);
const LoginForm3 = withRouter(LoginForm2 as any);

export default LoginForm3;
