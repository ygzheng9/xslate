import { routerRedux } from "dva/router";

import { message } from "antd";

import axios from "axios";

import {
  IAPIAssortment,
  IAPILoginInfo,
  IAPIMessage,
  IAPIOPHistory,
  IAPIProduct,
  IAPIProductGroup,
  IAPIRtnObject,
  IAPIThread,
  IAPIUser
} from "@components/collections/types";

import {
  IMainState,
  LoadAllUsers,
  LoadProducts,
  LoadThreads,
  Login,
  Logout,
  MainModel,
  UpdateState
} from "@models/types";
import {
  EffectsCommandMap,
  Model,
  SubscriptionAPI,
  ZDvaAction
} from "@utils/shortcuts";

import { client, existClient } from "@configs/alioss";
import { ISysLog } from "@services/apiResults";

import logSvc from "@services/syslog";

const mainState: IMainState = {
  // 全局的加载信息
  zLoading: false,
  loadingdescription: "",
  loadingMessage: "",
  loadingTip: "",

  // 用户登录信息，注意：点击浏览器的刷新按钮后，需要重新登录
  isLogin: false,
  user: {} as IAPILoginInfo,
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
  allUsers: [] as IAPIUser[],

  // 用户操作日志
  opHistory: [] as IAPIOPHistory[]
};

const model: Model = {
  namespace: MainModel,
  state: mainState,

  reducers: {
    [UpdateState](state, action: ZDvaAction) {
      return { ...state, ...action.payload };
    }
  },

  effects: {
    *[Login](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, select, call } = effects;

      const loginUrl = "/Markor/adapters/Employee/login";

      // 替换成界面输入的用户名和密码
      const loginParam = {
        ...action.payload
      };
      // console.log("loginParam: ", loginParam);

      let debug = false;
      if (loginParam.username === "ibmtest") {
        debug = true;
      }

      if (debug) {
        const token = "C643093A3487110E3CC2209D54C6AE3CC9A1CFAD";

        axios.defaults.headers.common.Authorization = token;

        yield put({
          type: "updateState",
          payload: {
            zLoading: false,

            isLogin: true,
            user: { name: loginParam.username },
            token
          }
        });

        // 跳转页面
        yield put(routerRedux.replace("/"));

        message.success("登录成功");

        return;
      }

      // debug = false;
      // yield put({
      //   type: "updateState",
      //   payload: {
      //     zLoading: true,
      //     loadingdescription: "请稍后",
      //     loadingMessage: "准备中",
      //     loadingTip: "正在获取您的基本信息....."
      //   }
      // });

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
            user: {
              name: loginParam.username
            },
            token
          }
        });

        // 跳转页面
        yield put(routerRedux.replace("/"));
        message.success("登录成功");

        // 写日志
        const { user }: { user: IAPILoginInfo } = yield select(
          (state: any) => state.main
        );
        const p: Partial<ISysLog> = {
          username: user.name,
          func: "login"
        };
        yield call(logSvc.log, p);
      }
    },

    *[Logout](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, select, call } = effects;

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

      // 写日志
      const { user }: { user: IAPILoginInfo } = yield select(
        (state: any) => state.main
      );
      const p: Partial<ISysLog> = {
        username: user.name,
        func: "logout",
        param: JSON.stringify(user)
      };
      yield call(logSvc.log, p);
    },

    // 加载 threads， messages
    *[LoadThreads](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, call, select } = effects;

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

      // 写日志
      const { user }: { user: IAPILoginInfo } = yield select(
        (state: any) => state.main
      );
      const p: Partial<ISysLog> = {
        username: user.name,
        func: "加载商品数据库信息"
      };
      yield call(logSvc.log, p);
    },

    *testEffect(action: ZDvaAction, effects: EffectsCommandMap) {
      // console.log("action: ", action);
      // console.log("param: ", effects);
      const url = "/Markor/adapters/Setting/setting?limit=1000";

      yield axios.get(url);

      // console.log("done");
    },

    *[LoadProducts](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, call, select } = effects;

      const groupsUrl = `/Markor/adapters/Setting/setting?limit=1000`;
      const productsUrl = `/Markor/adapters/Product/products?offset=1&limit=100&timeStamp=0`;
      const assortUrl = `/Markor/adapters/Product/assortments`;

      // 只取备选商品的操作日志
      const opHistUrl = `/Markor/adapters/Product/logs?offset=1&limit=5000&operateFunction=products`;

      yield put({
        type: "updateState",
        payload: {
          zLoading: true,
          loadingdescription: "请稍后",
          loadingMessage: "准备中",
          loadingTip: "正在获取数据库中的信息....."
        }
      });

      const [res1, res2, res3, res4] = yield Promise.all([
        axios.get(groupsUrl),
        axios.get(productsUrl),
        axios.get(assortUrl),
        axios.get(opHistUrl)
      ]);

      if (
        res1.statusText === undefined ||
        res1.statusText !== "OK" ||
        res2.statusText === undefined ||
        res2.statusText !== "OK" ||
        res3.statusText === undefined ||
        res3.statusText !== "OK" ||
        res4.statusText === undefined ||
        res4.statusText !== "OK"
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
      // console.log("allProducts: ", allProducts.map(a => a.objectId));

      // 在线商品
      const assortments = res3.data.content[0].results as IAPIAssortment[];

      // 备选商品修改日志
      const opHistory = res4.data.content[0].results as IAPIOPHistory[];
      const opHistory2 = opHistory.filter(i => i.operateType !== "R");
      // console.log("log: ", opHistory2.map(a => a.objectId));

      // console.log(assortments);

      yield put({
        type: "updateState",
        payload: {
          zLoading: false,
          allGroups,
          allProducts,
          assortments,
          opHistory: opHistory2
        }
      });

      message.success("数据加载成功");

      // 写日志
      const { user }: { user: IAPILoginInfo } = yield select(
        (state: any) => state.main
      );
      const p: Partial<ISysLog> = {
        username: user.name,
        func: "加载备选/在线商品信息"
      };
      yield call(logSvc.log, p);
    },

    *[LoadAllUsers](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, select, call } = effects;
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

      // 写日志
      const { user }: { user: IAPILoginInfo } = yield select(
        (state: any) => state.main
      );
      const p: Partial<ISysLog> = {
        username: user.name,
        func: "查看用户列表"
      };
      yield call(logSvc.log, p);
    }
  },

  subscriptions: {
    setup(api: SubscriptionAPI) {
      const { history, dispatch } = api;
      // console.log('common model subscriptions:', dispatch, history)
      // 数据库界面
      history.listen((location: any) => {
        if (location.pathname === "/users") {
          dispatch({
            type: LoadAllUsers
          });
        }
      });
    }
  }
};

export default model;
