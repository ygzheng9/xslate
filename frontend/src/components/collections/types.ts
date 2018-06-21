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

export interface ILoginUser {
  username: string;
  password: string;
  id?: number;
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

// 产品库

// 固定死的 3 级 ，value = grouping ，同时 name 是下一级的 name
export interface IAPIProductGroup {
  updatedAt: string;
  id: string;
  objectId: string;
  grouping?: string;
  name: string;
  value: string;
}

export interface IAPIProduct {
  attributes?: IAPIProductAttribute[];
  brand?: string;
  brandName?: any;
  catalogNumber: string;
  category?: string;
  createdAt: string;
  department: string;
  detail: string;
  event: string;
  id: string;
  lifeStyleName?: any;
  images?: IAPIImage[];
  manufacturer: string;
  name: string;
  objectId: string;
  price: number;
  priceUnit: string;
  productClass: string;
  productSubclass: string;
  rating?: number;
  section: string;
  series: string;
  updateTimeStamp: number;
  updatedAt: string;
  vendorNumber: string;
  vendorProductNumber: string;
  marketDate?: any;
  minNumber?: any;
  planDate?: any;
  status: string;
  abcType: string;
  netWeight?: any;
  originCountry: string;
  packageVolume?: any;
  sizeDescription: string;
  sizeHeight?: any;
  sizeLong?: any;
  sizeWidth?: any;
  retailPrice?: any;
  isdeleted: string;
}

export interface IAPIProductAttribute {
  id: string;
  name: string;
  product: string;
  values: IAPIAttrValue[];
}

export interface IAPIAttrValue {
  attribute: string;
  id: string;
  value: string;
}

// 用户清单
export interface IAPIUser {
  updatedAt: string;
  id: string;
  createdAt: string;
  objectId: string;
  name: string;
  role: string;
}

// 在线商品返回的数据，第一层
export interface IAPIAssortment {
  createdAt: string;
  department: string;
  id: string;
  itemNumber: string;
  num: string;
  name: string;
  objectId: string;
  planId: string;
  productClass: string;
  productSubclass: string;
  productes?: IAPIAssortmentProduct[];
  updatedAt: string;
}

// 在线商品返回的数据，第二层
export interface IAPIAssortmentProduct {
  brand: string;
  id: string;
  name: string;
  price: number;
  priceUnit: string;
  product: string;
  selected: boolean;
  thumbUrl: string;
  vproduct: string;
  productObjectId?: any;
  vproductObjectId?: any;
}

// 操作历史记录
export interface IAPIOPHistory {
  objectId: string;
  // 当前用户
  name: string;
  // products 备选商品
  operateFunction: string;
  // C R U D
  operateType: string;

  // 修改的具体内容
  content: string;

  // unix 到毫秒级的时间戳
  updateTimeStamp: string;
}
