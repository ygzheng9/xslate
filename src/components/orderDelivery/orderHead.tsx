import * as React from "react";

import {
  Button,
  Col,
  DatePicker,
  Divider,
  Icon,
  Popconfirm,
  Row,
  Table,
  TreeSelect
} from "antd";

import { ColumnProps } from "antd/lib/table";
import { TreeData } from "antd/lib/tree-select";

const { RangePicker } = DatePicker;

import * as moment from "moment";

import { IHead, IItem } from "./types";

const dateFormat = "YYYY-MM-DD";

// 订单头列表
export interface IOrderHeadProps {
  orders: IHead[];
  selectOrder: (order: IHead) => () => void;
  confirmOutbound: (order: IHead) => () => void;
  showPkgInfoModal: (o: IHead | IItem) => () => void;
  paramRange: [moment.Moment, moment.Moment];
  onParamRangeChange: (range: [moment.Moment, moment.Moment]) => void;
  currWarehouse: string;
  allWarehouses: TreeData[];
  onWarehouseChange: (value: string) => void;
  onSearch: () => void;
}

const OrderHead = ({
  orders,
  selectOrder,
  confirmOutbound,
  showPkgInfoModal,
  paramRange,
  onParamRangeChange,
  currWarehouse,
  allWarehouses,
  onWarehouseChange,
  onSearch
}: IOrderHeadProps) => {
  const items = orders;

  const columns: Array<ColumnProps<IHead>> = [
    {
      title: "#",
      dataIndex: "num",
      key: "num",
      render: (text, record) => (
        <a href="javascript:;" onClick={selectOrder(record)}>
          {text}
        </a>
      )
    },
    {
      title: "客户",
      dataIndex: "party",
      key: "party"
    },
    {
      title: "送货地址",
      dataIndex: "deliveryTo",
      key: "deliveryTo"
    },
    {
      title: "发货仓库",
      dataIndex: "warehouse",
      key: "warehouse"
    },
    {
      title: "创建时间",
      dataIndex: "createDate",
      key: "createDate"
    },
    {
      title: "创建人",
      dataIndex: "createUser",
      key: "createUser"
    },
    {
      title: "行数",
      dataIndex: "itemCnt",
      key: "itemCnt"
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark"
    },
    {
      title: "装箱信息",
      dataIndex: "pkgInfo",
      key: "pkgInfo"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        if (text === "已出库") {
          return `${text} ${record.outboundDate}`;
        } else {
          return text;
        }
      }
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        if (record.status === "待出库") {
          return (
            <span>
              <a href="javascript:;" onClick={showPkgInfoModal(record)}>
                <Icon type="edit" />
              </a>
              <Divider type="vertical" />
              <Popconfirm
                title="确认已出库？"
                onConfirm={confirmOutbound(record)}
                okText="Yes"
                cancelText="No"
              >
                <a href="javascript:;">
                  <Icon type="logout" />
                </a>
              </Popconfirm>
            </span>
          );
        }
        return "";
      }
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class HeadTable extends Table<IHead> {}

  return (
    <div>
      <Row>
        <Col span={4}>
          <RangePicker
            value={paramRange}
            format={dateFormat}
            onChange={onParamRangeChange}
          />
        </Col>
        <Col span={4}>
          <TreeSelect
            style={{ width: 300 }}
            value={currWarehouse}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={allWarehouses}
            placeholder="Please select"
            treeDefaultExpandAll={true}
            onChange={onWarehouseChange}
          />
        </Col>
        <Col>
          <Button onClick={onSearch}>查找</Button>
        </Col>
      </Row>
      <HeadTable columns={columns} dataSource={items} rowKey="num" />
    </div>
  );
};

export default OrderHead;
