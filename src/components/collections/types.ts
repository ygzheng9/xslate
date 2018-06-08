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

// 项目，自递归的树形结构，objectID - parentthread
export interface IAPIThread {
  createdAt: string;
  objectId: string;
  updatedAt: string;
  tags: string;
  id: string;
  visibility: string;
  name: string;
  messages: any[];
  parentthread?: string;
  childthreads: any[];
  flag: number;
  employee?: string;
  subscriptions?: any[];
}

// 项目下的内容
export interface IAPIMessage {
  objectId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  topic: string;
  text: string;
  documentType: string;
  created: string;
  visibility: string;
  employee?: string;
  tags: string;
  location?: string;
  thread?: string;
  flag: number;
  subscriptions?: any[];
  images?: IAPIImage[];
}

// 图片信息
export interface IAPIImage {
  localpath: string;
  osspath: string;
  type: string;
  modified: string;
  id: string;
  imageId: string;
  image?: any;
  height: number;
  width: number;
  parentEntity: string;
  flag: string;
}

// 用户信息
export interface IMarkorUser {
  username: string;
  password: string;
}

// 用户登录信息
export interface IAppLogin {
  // 当前用户是否登录
  isLogin: boolean;

  // 当前用户信息
  user: IMarkorUser;

  // server 返回的 token
  token: string;
}

// 全局信息
export interface IMarkorAppStates {
  // 是否正在加载数据
  isLoading: boolean;
  loadingTip: string;
  loadingMessage: string;
  loadingdescription: string;

  // 当前用户是否登录
  isLogin: boolean;

  // 当前用户信息
  user: IMarkorUser;

  // server 返回的 token
  token: string;

  // ali-oss 的客户端
  client: any;
}
