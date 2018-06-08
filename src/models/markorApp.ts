import { routerRedux } from "dva/router";

import { message } from "antd";

import axios from "axios";

import {
  IAPILoginInfo,
  IAPIMessage,
  IAPIRtnObject,
  IAPIThread,
  IMarkorUser
} from "@components/collections/types";

export default {
  namespace: "markorApp",
  state: {
    // 全局的加载信息
    zLoading: false,
    loadingdescription: "",
    loadingMessage: "",
    loadingTip: "",

    // 用户登录信息，注意：点击浏览器的刷新按钮后，需要重新登录
    isLogin: false,
    user: {} as IMarkorUser,
    token: "",

    // 全部的 Threads, Messages
    // 所有项目清单，项目是自包含的层级关系，objectaId 和 parentthread
    threads: [],
    messages: []
  },

  reducers: {
    updateState(state: any, action: any) {
      return { ...state, ...action.payload };
    }
  },

  effects: {
    *login(action: any, { put }: { put: any }) {
      const loginUrl = "/Markor/adapters/Employee/login";

      // 替换成界面输入的用户名和密码
      const loginParam: IMarkorUser = {
        ...action.payload
      };
      console.log("loginParam: ", loginParam);

      yield put({
        type: "updateState",
        payload: {
          zLoading: true,
          loadingdescription: "请稍后",
          loadingMessage: "准备中",
          loadingTip: "正在获取您的基本信息....."
        }
      });

      const res = yield axios.post(loginUrl, loginParam);
      const data: IAPIRtnObject = res.data as IAPIRtnObject;

      if (data.errors[0].statusMessage !== "SUCCESS") {
        yield put({
          type: "updateState",
          payload: {
            zLoading: false,

            isLogin: false
          }
        });

        message.error("用户名或密码错误，请重试");
      } else {
        const loginInfo = res.data.content[0] as IAPILoginInfo;
        const token = loginInfo.token;
        // 全局设置
        axios.defaults.headers.common.Authorization = token;
        console.log("token: ", token);

        yield put({
          type: "updateState",
          payload: {
            zLoading: false,

            isLogin: true,
            user: loginParam,
            token
          }
        });

        // 跳转页面
        yield put(routerRedux.replace("/markor"));

        message.success("登录成功");
      }
    },

    // 加载 threads， messages
    *loadThreads(action: any, { put }: { put: any }) {
      const threadsUrl = `/Markor/adapters/Message/threads?offset=&limit=&timeStamp=0`;
      const messagesUrl = `/Markor/adapters/Message/messages?offset=&limit=&timeStamp=0`;

      yield put({
        type: "updateState",
        payload: {
          zLoading: true,
          loadingdescription: "请稍后",
          loadingMessage: "准备中",
          loadingTip: "正在获取数据库中的信息....."
        }
      });

      const [res1, res2] = yield Promise.all([
        axios.get(threadsUrl),
        axios.get(messagesUrl)
      ]);

      // 处理 threads
      const threads = res1.data.content[0].results as IAPIThread[];
      // flag = 0 代表有效项目
      const validThreads = threads.filter(t => t.flag === 0);

      // 处理 Messages
      const messages = res2.data.content[0].results as IAPIMessage[];
      // flag = 0 代表有效项目
      const validMessages = messages.filter(
        t => t.flag === 0 && t.documentType === "data"
      );

      yield put({
        type: "updateState",
        payload: {
          zLoading: false,
          threads: validThreads,
          messages: validMessages
        }
      });

      message.success("数据加载成功");
    }
  },

  subscriptions: {
    setup({ dispatch, history }: { dispatch: any; history: any }) {
      // console.log('common model subscriptions:', dispatch, history)
      history.listen((location: any) => {
        if (location.pathname === "/markor") {
          // 加载
          dispatch({ type: "loadThreads" });
        }
      });
    }
  }
};
