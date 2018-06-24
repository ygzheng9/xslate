import {
  IAPIAssortment,
  IAPIMessage,
  IAPIOPHistory,
  IAPIProduct,
  IAPIProductGroup,
  IAPIThread,
  IAPIUser,
  ILoginUser
} from "@components/collections/types";

import { ISysLog } from "@services/apiResults";
import { RangeValue } from "@utils/shortcuts";

////////////////////////////////////////////////
// 定义 redux store 结构，目的在 connect 之后，可以通过类型约束，避免 typo

// dva 中每一个 model 的 namespace
export const MainModel = "main";
export const LogModel = "syslog";

// Model 中的方法名字
// 不同 model 中的名字可以相同，dispatch 调用时，type: `${modelName}/${methodName}`
export const UpdateState = "updateState";
export const LoadData = "loadData";
export const Login = "login";
export const Logout = "logout";
export const LoadProducts = "loadProducts";
export const LoadThreads = "loadThreads";
export const LoadAllUsers = "loadAllUsers";

///////////////////////////////////////////////
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

// model
export interface ISysState {
  logs: ISysLog[];
  paramCond: string;
  paramRange: RangeValue;
}
