import * as React from "react";

import { connect } from "dva";

import { Button, Form, Input, message, Row } from "antd";

import "./loginForm.css";

const FormItem = Form.Item;

// LoginForm 是 connect 到 redux 中，取里面的 app 数据
const LoginForm = (props: any) => {
  const {
    form: { validateFieldsAndScroll, getFieldDecorator },
    dispatch,
    loading
  } = props;

  const handleOk = () => {
    console.log("clicked.");

    validateFieldsAndScroll((errors: any, values: any) => {
      console.log("validate.");

      if (errors) {
        message.error("登录失败，请重试");
        return;
      }

      const actionType = "markorApp/login";
      // const actionType = "markorApp/testEffect";

      dispatch({
        type: actionType,
        payload: values
      });
    });
  };

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
            <Button type="primary" onClick={handleOk} loading={loading}>
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
};

const LoginForm2 = Form.create()(LoginForm);

// 把 store 中的 state 映射到 组件的 属性
function mapStateToProps(state: any) {
  return {
    loading: state.loading.models.markorApp
  };
}

export default connect(mapStateToProps)(LoginForm2);
