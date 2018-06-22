import { EffectsCommandMap, Model, SubscriptionAPI } from "dva";

import {
  IAPIAssortment,
  IAPILoginInfo,
  IAPIMessage,
  IAPIOPHistory,
  IAPIProduct,
  IAPIProductGroup,
  IAPIThread,
  IAPIUser,
  ILoginUser
} from "@components/collections/types";

export { IAPILoginInfo, ILoginUser };

///////////////////
// dva 中 action 类型
interface IDvaAction {
  type: string;
  payload?: any;
}

// dva 中 dispatch 类型
type IDvaDispatch = (action: IDvaAction) => any;

// 被 connect 修饰后的组件
interface IZConnectedComponent {
  dispatch: IDvaDispatch;
}

export {
  IDvaAction,
  IDvaDispatch,
  IZConnectedComponent,
  EffectsCommandMap,
  Model,
  SubscriptionAPI
};

////////////////////////////////////////////////
// 定义 redux store 结构，目的在 connect 之后，可以通过类型约束，避免 typo

// dva 中每一个 model 的 namespace
export const MainModel = "main";
export const LogModel = "syslog";

// redux store
export interface IGlobalState {
  loading: {
    global: boolean;
    models: {
      [MainModel]: boolean;
      [LogModel]: boolean;
    };
  };
  [MainModel]: IMainState;
  [LogModel]: ISysState;
}

// modal
export interface IMainState {
  // 全局的加载信息
  zLoading: boolean;
  loadingdescription: string;
  loadingMessage: string;
  loadingTip: string;

  // 用户登录信息，注意：点击浏览器的刷新按钮后，需要重新登录
  isLogin: boolean;
  user: ILoginUser;
  token: string;

  // 全部的 Threads, Messages
  // 所有项目清单，项目是自包含的层级关系，objectaId 和 parentthread
  threads: IAPIThread[];
  messages: IAPIMessage[];

  // ali-oss 客户端
  client: any;

  // 在线商品的 ali-oss 客户端
  existClient: any;

  // 产品组
  allGroups: IAPIProductGroup[];

  // 备选库
  allProducts: IAPIProduct[];

  // 在线商品 assortment，其下有 products
  assortments: IAPIAssortment[];

  // 用户清单
  allUsers: IAPIUser[];

  // 用户操作日志
  opHistory: IAPIOPHistory[];
}

export interface ISysLog {
  id: number;
  username: string;
  serverDT: string;
  remoteIP: string;
  func: string;
  param: string;
}

export interface ISysState {
  logs: ISysLog[];
}
