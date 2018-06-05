// 订单头信息
export interface IHead {
  id: string;
  // 单号
  num: string;
  // 合作伙伴
  party: string;
  // 送货地址、发货仓库
  deliveryTo: string;
  warehouse: string;
  // 单据创建时间、创建人
  createDate: string;
  createUser: string;
  // 行项目数量
  itemCnt: string;
  // 金额、币种
  amount: number;
  currency: string;
  // 备注
  remark: string;
  // 装箱信息
  pkgInfo: string;
  // 状态: 待发货，已发货
  status: string;
  // 对于出库的，出库时间
  outboundDate: string;
}

// 订单行项目信息
export interface IItem {
  // 行项目 num
  num: string;
  // 料号、名称
  matCode: string;
  matName: string;
  // 物料对应的客户名称
  matCust: string;
  // 数量
  qty: number;
  // 装箱信息
  pkgInfo: string;
}
