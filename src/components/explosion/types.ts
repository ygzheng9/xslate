// 工号设备BOM的平面结构
// key 是 react 的保留项，不建议直接使用
export interface IFlatNode {
  id?: string;
  title: string;
  key: string;
  parent: string;
}

// 仓库，协议量，可用量
export interface IStockInfo {
  warehouse: string;
  avlQty: number;
  contractQty: number;
}

// 工号基本信息
export interface IProject {
  pName: string;
  pic: string;
  active: boolean;
}

// 一个产品类型的信息
export interface ICategory {
  pType: string;
  items: IProject[];
}
