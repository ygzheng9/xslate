import * as React from "react";

import { Breadcrumb, Button, Table } from "antd";

import { connect } from "dva";

import { TypedColumn } from "@components/types";
import { IDvaDispatch, IGlobalState, ISysLog, LogModel } from "@models/types";

function mapStateToProps(state: IGlobalState) {
  const sys = state[LogModel];
  return {
    logs: sys.logs
  };
}

function mapDispatchToProps(dispatch: IDvaDispatch) {
  return {
    loadLogs: () =>
      dispatch({
        type: `${LogModel}/loadAllLogs`
      })
  };
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const LogMgmt: React.SFC<Props> = props => {
  const columns: TypedColumn<ISysLog> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "访问时间",
      dataIndex: "serverDT",
      key: "serverDT"
    },
    {
      title: "IP",
      dataIndex: "remoteIP",
      key: "remoteIP"
    },
    {
      title: "功能",
      dataIndex: "func",
      key: "func"
    },
    {
      title: "参数",
      dataIndex: "param",
      key: "param"
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<ISysLog> {}

  return (
    <div>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>{"系统日志"}</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
        <Button onClick={props.loadLogs}>刷新</Button>
        <ItemTable
          size="middle"
          columns={columns}
          dataSource={props.logs}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogMgmt);
