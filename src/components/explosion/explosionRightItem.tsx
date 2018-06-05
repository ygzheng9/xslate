import * as React from "react";

import { Button, Col, InputNumber, Popover } from "antd";

import { IStockInfo } from "./types";

import "./explosion.css";

const ButtonGroup = Button.Group;

// 右边的下级列表

export interface ILineItemProps {
  title: string;
  id: string;
  onChange: (a: number) => void;

  // 库存信息汇总
  contractAvl?: number;
  contractTTL?: number;
  nonContract?: number;

  // 库存信息明细
  contractStock?: IStockInfo[];
  nonContractStock?: IStockInfo[];
}

// tslint:disable-next-line:max-classes-per-file
const LineItem = ({ title, id, onChange }: ILineItemProps) => {
  // TODO: 从后台获取的数据中，包括了库存信息：协议仓库的可用量/协议量，非协议仓库可用量
  const contractAvl = 7;
  const contractTTL = 10;
  const nonContract = 6;
  const contractInv = (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ width: 150 }}>仓库</th>
            <th style={{ width: 50 }}>协议</th>
            <th style={{ width: 50 }}>可用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>B001</td>
            <td>5</td>
            <td>5</td>
          </tr>
          <tr>
            <td>C001</td>
            <td>5</td>
            <td>3</td>
          </tr>
          <tr>
            <td>{"2 - 等待供应商交货 - 2018-05-28"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  const otherInv = (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ width: 150 }}>仓库</th>
            <th style={{ width: 50 }}>可用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A001</td>
            <td>2</td>
          </tr>
          <tr>
            <td>P005</td>
            <td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="fullWidth">
      <Col span={14}>{`${title} : ${id}`}</Col>
      <Col span={8}>
        <ButtonGroup>
          <Popover content={contractInv} title="协议库存">
            <Button>{`协议 ${contractAvl}/${contractTTL}`}</Button>
          </Popover>
          <Popover content={otherInv} title="其它库存">
            <Button>{`其它 ${nonContract} `}</Button>
          </Popover>
        </ButtonGroup>
      </Col>
      <Col span={2}>
        <InputNumber
          style={{ width: 55 }}
          defaultValue={0}
          min={0}
          max={100}
          step={1}
          onChange={onChange}
        />
      </Col>
    </div>
  );
};

export default LineItem;
