import { EffectsCommandMap, Model, SubscriptionAPI } from "dva";

import {
  IAPIAssortment,
  IAPILoginInfo,
  IAPIOPHistory,
  IAPIProduct,
  IAPIProductGroup,
  IAPIRtnObject,
  IAPIUser
} from "@components/collections/types";

// import { Action } from "redux";

// dva 中 action 类型
interface IZAction {
  type: string;
  payload?: any;
}

// dva 中 dispatch 类型
type ZDispatch = (action: IZAction) => any;

// 被 connect 修饰后的组件
interface IZConnectedComponent {
  dispatch: ZDispatch;
}

export {
  IZAction,
  ZDispatch,
  IZConnectedComponent,
  EffectsCommandMap,
  Model,
  SubscriptionAPI
};

////////////////////////////////////////////////
// 定义 redux store 结构，目的在 connect 之后，可以通过类型约束，避免 typo

// dva 中每一个 model 的 namespace
export const MainModel = "main";

// redux store
export interface IGlobalState {
  loading: {
    global: boolean;
    models: {
      [MainModel]: boolean;
    };
  };
  [MainModel]: IMainModel;
}

// modal
export interface IMainModel {
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
  threads: any[];
  messages: any[];

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

///////////////////////////////////////////
// 后台 API 返回的对象
export interface IAPIRtnObject {
  errors: IAPIRtnError[];
  // 不同的 API 返回的 content 格式不同
  content: any[];
}

// 所有 API 返回的错误信息
export interface IAPIRtnError {
  statusCode: string;
  statusMessage: string;
}

// 登录 API 返回的具体内容
export interface IAPILoginInfo {
  token: string;
  role: any[];
  roleName: any[];
  id: string;
  name: string;
}

// 用户信息
export interface ILoginUser {
  username: string;
  password: string;
  id?: number;
}
