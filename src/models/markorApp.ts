import { routerRedux } from "dva/router";

import { message } from "antd";

import axios from "axios";

import OSS from "ali-oss";

import {
  EffectsCommandMap,
  IDvaAction,
  Model,
  SubscriptionAPI
} from "@models/types";

import {
  IAPIAssortment,
  IAPILoginInfo,
  IAPIMessage,
  IAPIProduct,
  IAPIProductGroup,
  IAPIRtnObject,
  IAPIThread,
  IAPIUser,
  IMarkorUser
} from "@components/collections/types";

// 建立 ali-oss 的客户端
const client = new OSS({
  accessKeyId: "LTAIJuSjXPx3B35m",
  accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
  region: "oss-cn-shanghai",
  bucket: "ordercommit"
});

// 建立 ali-oss 的客户端，在线商品信息
const existClient = new OSS.Wrapper({
  accessKeyId: "LTAIJuSjXPx3B35m",
  accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
  region: "oss-cn-hangzhou",
  bucket: "mfrwxoss"
});

const model: Model = {
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
    messages: [],

    // ali-oss 客户端
    client,

    // 在线商品的 ali-oss 客户端
    existClient,

    // 产品组
    allGroups: [] as IAPIProductGroup[],

    // 备选库
    allProducts: [] as IAPIProduct[],

    // 在线商品 assortment，其下有 products
    assortments: [] as IAPIAssortment[],

    // 用户清单
    allUsers: [] as IAPIUser[]
  },

  reducers: {
    updateState(state, action: IDvaAction) {
      return { ...state, ...action.payload };
    }
  },

  effects: {
    *login(action: IDvaAction, effects: EffectsCommandMap) {
      const { put } = effects;

      const loginUrl = "/Markor/adapters/Employee/login";

      // 替换成界面输入的用户名和密码
      const loginParam: IMarkorUser = {
        ...action.payload
      };
      console.log("loginParam: ", loginParam);

      const debug = false;
      if (debug) {
        const token = "C9383C442F5FEAA38483A820A027A5EA11FF73A7";
        // const token = "C9383C442F5FEAA38483A820A027A5EA11FF7399";

        axios.defaults.headers.common.Authorization = token;

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
        yield put(routerRedux.replace("/"));

        message.success("登录成功");

        return;
      }

      // debug = false;
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
        yield put(routerRedux.replace("/"));

        message.success("登录成功");
      }
    },

    *logout(action: IDvaAction, effects: EffectsCommandMap) {
      const { put } = effects;

      yield put({
        type: "updateState",
        payload: {
          zLoading: false,

          isLogin: false,
          user: {},
          token: ""
        }
      });
      // 跳转页面
      yield put(routerRedux.replace("/"));
    },

    // 加载 threads， messages
    *loadThreads(action: IDvaAction, effects: EffectsCommandMap) {
      const { put } = effects;

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
    },

    *testEffect(action: IDvaAction, effects: EffectsCommandMap) {
      console.log("action: ", action);
      console.log("param: ", effects);
      const url = "/Markor/adapters/Setting/setting?limit=1000";

      yield axios.get(url);

      console.log("done");
    },

    *loadProducts(action: IDvaAction, effects: EffectsCommandMap) {
      const { put } = effects;

      const groupsUrl = `/Markor/adapters/Setting/setting?limit=1000`;
      const productsUrl = `/Markor/adapters/Product/products?offset=1&limit=100&timeStamp=0`;
      const assortUrl = `/Markor/adapters/Product/assortments`;

      yield put({
        type: "updateState",
        payload: {
          zLoading: true,
          loadingdescription: "请稍后",
          loadingMessage: "准备中",
          loadingTip: "正在获取数据库中的信息....."
        }
      });

      const [res1, res2, res3] = yield Promise.all([
        axios.get(groupsUrl),
        axios.get(productsUrl),
        axios.get(assortUrl)
      ]);

      if (
        res1.statusText === undefined ||
        res1.statusText !== "OK" ||
        res2.statusText === undefined ||
        res2.statusText !== "OK" ||
        res3.statusText === undefined ||
        res3.statusText !== "OK"
      ) {
        message.error("网络故障，请稍后重试");

        yield put({
          type: "updateState",
          payload: {
            zLoading: false
          }
        });
        return;
      }

      // 产品组
      const allGroups = res1.data.content as IAPIProductGroup[];

      // 备选商品
      const allProducts = res2.data.content[0].results as IAPIProduct[];

      // 在线商品
      const assortments = res3.data.content[0].results as IAPIAssortment[];

      // console.log(assortments);

      yield put({
        type: "updateState",
        payload: {
          zLoading: false,
          allGroups,
          allProducts,
          assortments
        }
      });

      message.success("数据加载成功");
    },

    *loadAllUsers(action: IDvaAction, effects: EffectsCommandMap) {
      const { put } = effects;
      const url = `/Markor/adapters/Employee/employees`;

      const result = yield axios.get(url);
      // console.log(result);

      if (result.statusText === undefined || result.statusText !== "OK") {
        message.error("网络故障，请稍后重试");
        return;
      }

      const users = result.data.content as IAPIUser[];
      // console.log("users: ", users);

      yield put({
        type: "updateState",
        payload: {
          allUsers: users
        }
      });

      message.info("用户列表加载完毕");
    }
  },

  subscriptions: {
    setup(api: SubscriptionAPI) {
      const { history } = api;
      // console.log('common model subscriptions:', dispatch, history)
      // 数据库界面
      history.listen((location: any) => {
        if (location.pathname === "/threads") {
          // 加载
          // dispatch({ type: "loadThreads" });
          console.log("to threads...");
        }
      });
      history.listen((location: any) => {
        if (location.pathname === "/products") {
          // 加载
          // dispatch({ type: "loadProducts" });
          console.log("to products...");
        }
      });
    }
  }
};

export default model;
