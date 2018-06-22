import * as React from "react";

import { Badge, Divider, Popconfirm, Table } from "antd";

import { IBizEvent, IRefItem, RefItemOp, TypedColumn } from "@components/types";

import { ILoginUser } from "@components/collections/types";

type BizEventFunc = (entry: IBizEvent) => void;

export interface IEventListProps {
  user: ILoginUser;

  items: IBizEvent[];

  onUpdate: (data: IBizEvent, readOnly: boolean) => void;
  onDelete: (id: number) => void;
  onCloseEvent: (id: number) => void;

  // 显示 todo，附件、评论
  showTodo: RefItemOp;
  showAttach: RefItemOp;
  onShowFeedback: BizEventFunc;
}

const EventList: React.SFC<IEventListProps> = props => {
  const {
    items,
    onUpdate,
    onDelete,
    showTodo,
    showAttach,
    user,
    onShowFeedback,
    onCloseEvent
  } = props;

  const onCloseEventWrap = (id: number) => () => {
    onCloseEvent(id);
  };

  const onUpdateWrap = (data: IBizEvent, readOnly: boolean) => () => {
    onUpdate(data, readOnly);
  };

  const onDeleteWrap = (id: number) => () => {
    onDelete(id);
  };

  const onShowFeedbackWrap = (record: IBizEvent) => () => {
    onShowFeedback(record);
  };

  const openTodoWnd = (item: IBizEvent) => () => {
    const refItem: IRefItem = {
      ref_id: item.id,
      ref_type: "Events",
      ref_title: item.subject
    };
    showTodo(refItem);
  };

  const openAttachWnd = (item: IBizEvent) => () => {
    const refItem: IRefItem = {
      ref_id: item.id,
      ref_type: "Events",
      ref_title: item.subject
    };
    showAttach(refItem);
  };

  const columns: TypedColumn<IBizEvent> = [
    {
      title: "#",
      dataIndex: "seq_no",
      key: "seq_no",
      width: 50
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
      width: 150
    },
    {
      title: "发起人",
      dataIndex: "user_name",
      key: "user_name",
      width: 100
    },
    {
      title: "时间",
      dataIndex: "happen_at",
      key: "happen_at",
      width: 200
    },
    {
      title: "主题",
      dataIndex: "subject",
      key: "subject",
      width: 400,
      render: (text, record) => {
        const tag = (
          <a onClick={openTodoWnd(record)}>
            <Badge count={record.open_cnt}>{text}</Badge>
          </a>
        );

        return tag;
      }
    },
    // {
    //   title: '地点',
    //   dataIndex: 'place',
    //   key: 'place',
    // },
    // {
    //   title: '备注',
    //   dataIndex: 'memo',
    //   key: 'memo',
    // },
    {
      title: "操作",
      key: "operation",
      render: (text, record) => {
        // 该事件下所有待办都完成后，才允许关闭该事件
        const canClose =
          record.event_status !== "CLOSED" && record.open_cnt === 0;
        const closeTag = canClose ? (
          <span>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要关闭吗?"
              okText="确定"
              cancelText="取消"
              onConfirm={onCloseEventWrap(record.id)}
            >
              <a>关闭</a>
            </Popconfirm>
          </span>
        ) : (
          ""
        );

        // 只有创建者，才允许修改
        const canModify =
          record.user_name === user.username &&
          record.event_status !== "CLOSED";
        const modifyTag = canModify ? (
          <span>
            <Divider type="vertical" />
            <a onClick={onUpdateWrap(record, false)}>修改</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗?"
              okText="确定"
              cancelText="取消"
              onConfirm={onDeleteWrap(record.id)}
            >
              <a>删除</a>
            </Popconfirm>
            {closeTag}
          </span>
        ) : (
          ""
        );

        return (
          <span>
            <a onClick={onUpdateWrap(record, true)}>详情</a>
            <Divider type="vertical" />
            <a onClick={openAttachWnd(record)}>附件</a>
            <Divider type="vertical" />
            <a onClick={onShowFeedbackWrap(record)}>留言</a>
            {modifyTag}

            {record.event_status === "CLOSED" && (
              <span>
                <Divider type="vertical" />
                {"已关闭"}
              </span>
            )}
          </span>
        );
      }
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<IBizEvent> {}

  return (
    <div>
      <ItemTable
        size="middle"
        columns={columns}
        dataSource={items}
        rowKey="id"
        scroll={{ x: 1600 }}
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
};

export default EventList;
