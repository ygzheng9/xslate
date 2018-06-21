import * as React from "react";

import { connect } from "dva";

import { Breadcrumb, Button, Row, Table } from "antd";

import { IAPIUser } from "@components/collections/types";
import { TypedColumn } from "@components/types";
import { IGlobalState, MainModel } from "@models/types";

interface IUserMgmtProps {
  loadAllData: () => void;
  allUsers: IAPIUser[];
}

const UserMgmt = (props: IUserMgmtProps) => {
  const { loadAllData, allUsers } = props;

  const loadAll = () => {
    loadAllData();
  };

  const columns: TypedColumn<IAPIUser> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120
    },
    {
      title: "用户名",
      dataIndex: "name",
      key: "name",
      width: 200
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 200
    }
  ];

  const btnTitle = "数据未加载，点击加载";

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<IAPIUser> {}

  return (
    <div>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>用户清单</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
        {allUsers.length === 0 && (
          <Button onClick={loadAll}> {btnTitle} </Button>
        )}

        <div>
          <Row>
            <ItemTable columns={columns} dataSource={allUsers} rowKey="id" />
          </Row>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(store: IGlobalState) {
  const main = store[MainModel];

  const { allUsers } = main;

  return {
    allUsers
  };
}

// 把 dispatch 映射到组件的属性，这样组件中就可以不出现 dispatch 了
// 注意，这里定义的都是 func，而不是一个 dispatch 调用；
function mapDispatchToProps(dispatch: any) {
  return {
    // 根据 ref 查找变更记录
    loadAllData: () => {
      dispatch({
        type: `${MainModel}/loadAllUsers`
      });
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserMgmt);
