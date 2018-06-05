import { IHead, IItem } from "./types";

// 假数据
export const orderList: IHead[] = [
  {
    id: "1",
    // 单号
    num: "800001",
    // 合作伙伴
    party: "洋山四期",

    // 单据创建时间、创建人
    createDate: "2018-05-20",
    createUser: "shengxc",
    // 行项目数量
    itemCnt: "5",
    // 金额、币种
    amount: 50000,
    currency: "CNY",
    // 备注
    remark: "客户急要",
    // 装箱信息
    pkgInfo: "",
    status: "待出库",
    deliveryTo: "",
    warehouse: "",
    outboundDate: ""
  },
  {
    id: "2",
    // 单号
    num: "800123",
    // 合作伙伴
    party: "洋山四期",
    // 单据创建时间、创建人
    createDate: "2018-05-25",
    createUser: "shengxc",
    // 行项目数量
    itemCnt: "2",
    // 金额、币种
    amount: 100000,
    currency: "CNY",
    // 备注
    remark: "",
    // 装箱信息
    pkgInfo: "",
    status: "待出库",

    deliveryTo: "",
    warehouse: "",
    outboundDate: ""
  },
  {
    id: "3",
    // 单号
    num: "800789",
    // 合作伙伴
    party: "巴拿马",
    // 单据创建时间、创建人
    createDate: "2018-05-29",
    createUser: "fanm",
    // 行项目数量
    itemCnt: "9",
    // 金额、币种
    amount: 90000,
    currency: "USD",
    // 备注
    remark: "",
    // 装箱信息
    pkgInfo: "",
    status: "已出库",
    outboundDate: "2018-05-27",

    deliveryTo: "",
    warehouse: ""
  }
];

export const orderItems: IItem[] = [
  {
    num: "1",
    matCode: "A001",
    matName: "轴承A",
    matCust: "AAA",
    qty: 1,
    pkgInfo: "1#"
  },
  {
    num: "2",
    matCode: "C098",
    matName: "轮胎A",
    matCust: "BBB",
    qty: 3,
    pkgInfo: "2#1个，3#2个"
  }
];

export const warehouseList = [
  {
    label: "总司",
    value: "0-0",
    key: "0-0",
    children: [
      {
        label: "总司仓1",
        value: "0-0-1",
        key: "0-0-1"
      },
      {
        label: "总司仓2",
        value: "0-0-2",
        key: "0-0-2"
      }
    ]
  },
  {
    label: "检测公司",
    value: "0-1",
    key: "0-1",
    children: [
      {
        label: "检测公司仓1",
        value: "0-1-1",
        key: "0-1-1"
      }
    ]
  },
  {
    label: "Terminexus",
    value: "0-2",
    key: "0-2",
    children: [
      {
        label: "亚洲仓1",
        value: "0-2-1",
        key: "0-2-1"
      },
      {
        label: "欧洲仓2",
        value: "0-2-2",
        key: "0-2-2"
      }
    ]
  }
];
