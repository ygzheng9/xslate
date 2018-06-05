import * as React from "react";

import { Button, Icon, Table } from "antd";

import { ColumnProps } from "antd/lib/table";

import { IHead, IItem } from "./types";

export interface IOrderItemProps {
  currOrder: IHead;
  items: IItem[];
  backToOrder: () => void;
  selectItem: (i: IItem) => () => void;
  showPkgInfoModal: (o: IHead | IItem) => () => void;
}

// 行项目类表
const OrderItem = ({
  currOrder,
  items,
  backToOrder,
  showPkgInfoModal
}: IOrderItemProps) => {
  const columns: Array<ColumnProps<IItem>> = [
    {
      title: "#",
      dataIndex: "num",
      key: "num"
    },
    {
      title: "物料",
      dataIndex: "matCode",
      key: "matCode"
    },
    {
      title: "名称",
      dataIndex: "matName",
      key: "matName"
    },
    {
      title: "客户物料",
      dataIndex: "matCust",
      key: "matCust"
    },
    {
      title: "数量",
      dataIndex: "qty",
      key: "qty"
    },
    {
      title: "装箱信息",
      dataIndex: "pkgInfo",
      key: "pkgInfo"
    },
    {
      title: "操作",
      key: "action",
      render: record => {
        if (currOrder.status === "待出库") {
          return (
            <span>
              <a href="javascript:;" onClick={showPkgInfoModal(record)}>
                <Icon type="edit" />
              </a>
            </span>
          );
        } else {
          return "";
        }
      }
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<IItem> {}

  return (
    <div>
      <Button onClick={backToOrder}>
        <Icon type="left" />返回
      </Button>
      {`发货单号：${currOrder.num}`}
      <ItemTable columns={columns} dataSource={items} rowKey="num" />
    </div>
  );
};

export default OrderItem;
