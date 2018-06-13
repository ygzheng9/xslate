import * as React from "react";

import { Breadcrumb, Input, message, Modal } from "antd";

const Search = Input.Search;

import * as moment from "moment";

import { IHead, IItem } from "./types";

import OrderHead, { IOrderHeadProps } from "./orderHead";
import OrderItem, { IOrderItemProps } from "./orderItem";

import { orderItems, orderList, warehouseList } from "./mockData";

interface IPkgInfoEntryProps {
  pkgInfo: string;
  onEntryChanged: (e: React.FormEvent<HTMLInputElement>) => void;
  onEntrySave: () => void;
}

// 装箱信息的输入
const PkgInfoEntry = ({
  pkgInfo,
  onEntryChanged,
  onEntrySave
}: IPkgInfoEntryProps) => {
  const msg = "请录入装箱信息";
  return (
    <div>
      {msg}
      <Search
        style={{ height: 32 }}
        value={pkgInfo}
        onChange={onEntryChanged}
        onSearch={onEntrySave}
        enterButton="保存"
      />
    </div>
  );
};

interface IOrderMgmtState {
  // 订单列表
  orders: IHead[];

  // 当前选中订单
  currOrder: IHead;

  // 当前显示模式：订单列表，订单行项目列表
  displayHead: boolean;

  // 当前订单行项目
  items: IItem[];

  currItem: IItem;

  // 是否显示装箱信息的 modal
  pkgInfo: string;
  pkgModal: boolean;

  // 查询时间区间
  paramRange: [moment.Moment, moment.Moment];

  // 查询的仓库
  currWarehouse: string;
}

// tslint:disable-next-line:max-classes-per-file
class OrderMgmt extends React.Component<{}, IOrderMgmtState> {
  constructor(props: {}) {
    super(props);

    const end = moment().add(1, "days");
    const start = moment().add(-1, "months");

    this.state = {
      // 订单列表
      orders: [] as IHead[],

      // 当前选中订单
      currOrder: {} as IHead,

      // 当前显示模式：订单列表，订单行项目列表
      displayHead: true,

      // 当前订单行项目
      items: [] as IItem[],

      currItem: {} as IItem,

      // 是否显示装箱信息的 modal
      pkgInfo: "",
      pkgModal: false,

      // 查询时间区间
      paramRange: [start, end],

      // 查询的仓库
      currWarehouse: "0-2-1"
    };
  }

  public componentDidMount() {
    // TODO: 从 API 获取信息
    const orders = orderList;
    this.setState({
      orders
    });
  }

  // 点击订单头
  // 设定当前的订单头，加载行项目， 设置当前行项目为空
  public selectOrder = (order: IHead) => () => {
    console.log("select: ", order);
    const items = this.loadItems();
    this.setState({
      currOrder: order,
      displayHead: false,
      items,
      currItem: {} as IItem
    });
  };

  // 在行项目页面，点击了 返回
  public backToOrder = () => {
    this.setState({
      displayHead: true
    });
  };

  public loadItems = (): IItem[] => {
    // TODO: 根据传入的单号，加载订单行项目
    return orderItems;
  };

  // 选中一个订单行项目
  public selectItem = (item: IItem) => () => {
    console.log("item: ", item);
    this.setState({
      currItem: item
    });
  };

  // 订单头确认出库（发货单）
  public confirmOutbound = (order: IHead) => () => {
    // TODO: 通过 API 更新数据，并且重新加载 订单list
    const { orders } = this.state;
    order.status = "已出库";
    order.outboundDate = moment().format("YYYY-MM-DD");
    const remains = orders.filter(i => i.num !== order.num);
    remains.push(order);

    this.setState({
      orders: remains,
      currOrder: {} as IHead
    });

    message.success(`单号 ${order.num} 出库完成`);
  };

  // 显示/隐藏 装箱信息的 modal
  public showPkgInfoModal = (record: IHead | IItem) => () => {
    const { displayHead } = this.state;

    // 修改订单头的装箱信息
    if (displayHead) {
      this.setState({
        currOrder: record as IHead,
        pkgInfo: record.pkgInfo,
        pkgModal: true
      });
    } else {
      // 修改行项目的装箱信息
      this.setState({
        currItem: record as IItem,
        pkgInfo: record.pkgInfo,
        pkgModal: true
      });
    }
  };

  // 受控：一天工时填报的数据
  public onEntryChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    this.setState({
      pkgInfo: target.value
    });
  };

  // 关闭装箱信息的 modal
  public onEntryCancel = () => {
    this.setState({
      pkgModal: false
    });
  };

  // 订单头的装箱信息保存
  public onEntrySave = () => {
    const {
      currOrder,
      pkgInfo,
      orders,
      currItem,
      items,
      displayHead
    } = this.state;

    if (displayHead) {
      // TODO: 把 pkgInfo 保存到 currOrder 中，重新加载数据，刷新页面；

      const remains = orders.filter(i => i.num !== currOrder.num);
      currOrder.pkgInfo = pkgInfo;
      remains.push(currOrder);

      this.setState({
        orders: remains,
        currOrder: {} as IHead,
        pkgInfo: "",
        pkgModal: false
      });
    } else {
      // TODO: 把 pkgInfo 保存到 currItem 中，重新加载数据，刷新页面；

      const remains = items.filter(i => i.num !== currItem.num);
      currItem.pkgInfo = pkgInfo;
      remains.push(currItem);

      this.setState({
        items: remains,
        currItem: {} as IItem,
        pkgInfo: "",
        pkgModal: false
      });
    }
  };

  // 受控：选择期间
  public onParamRangeChange = (range: [moment.Moment, moment.Moment]) => {
    this.setState({
      paramRange: range
    });
  };

  public onSearch = () => {
    console.log("根据查询条件，从 API 获取数据。");
  };

  public onWarehouseChange = (value: string) => {
    console.log(value);
    this.setState({ currWarehouse: value });
  };

  public render() {
    const {
      orders,
      currOrder,
      displayHead,
      items,
      // selectItem,
      pkgInfo,
      pkgModal,
      paramRange,
      currWarehouse
    } = this.state;

    const headProps: IOrderHeadProps = {
      // 按单号排序
      orders: orders.sort(
        (a, b) => (a.num === b.num ? 0 : a.num >= b.num ? 1 : -1)
      ),
      selectOrder: this.selectOrder,
      confirmOutbound: this.confirmOutbound,
      showPkgInfoModal: this.showPkgInfoModal,
      paramRange,
      onParamRangeChange: this.onParamRangeChange,
      currWarehouse,
      allWarehouses: warehouseList,
      onWarehouseChange: this.onWarehouseChange,
      onSearch: this.onSearch
    };

    const itemProps: IOrderItemProps = {
      currOrder,
      // 按照行项目号排序
      items: items.sort(
        (a, b) => (a.num === b.num ? 0 : a.num >= b.num ? 1 : -1)
      ),
      backToOrder: this.backToOrder,
      selectItem: this.selectItem,
      showPkgInfoModal: this.showPkgInfoModal
    };

    const displayTag = displayHead ? (
      <OrderHead {...headProps} />
    ) : (
      <OrderItem {...itemProps} />
    );

    const entryProps: IPkgInfoEntryProps = {
      pkgInfo,
      onEntryChanged: this.onEntryChanged,
      onEntrySave: this.onEntrySave
    };

    const entryTag = pkgModal ? (
      <Modal footer={null} visible={pkgModal} onCancel={this.onEntryCancel}>
        <PkgInfoEntry {...entryProps} />
      </Modal>
    ) : (
      ""
    );

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>订单管理</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {displayTag}
          {entryTag}
        </div>
      </div>
    );
  }
}

export default OrderMgmt;
