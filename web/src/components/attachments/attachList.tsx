import * as React from "react";

import { Divider, Popconfirm } from "antd";

// import * as R from "ramda";

import { IAPILoginInfo } from "@components/collections/types";
import { IAttchItem } from "@services/apiResults";
import { TypedColumn, TypedTable } from "@utils/shortcuts";

type AttchItemAction = (entry: IAttchItem) => void;

interface IAttachListProps {
  user: IAPILoginInfo;
  list: IAttchItem[];
  onDownload: AttchItemAction;
  onDelete: AttchItemAction;
  onShowFeedback: AttchItemAction;
}
const AttachList: React.SFC<IAttachListProps> = props => {
  const { list, onDownload, onDelete, user, onShowFeedback } = props;

  const handleShowFeedback = (entry: IAttchItem) => () => onShowFeedback(entry);
  // const handleShowFeedback = R.curry(onShowFeedback);

  const columns: TypedColumn<IAttchItem> = [
    {
      title: "文件名",
      dataIndex: "file_name",
      key: "file_name"
    },
    {
      title: "描述",
      dataIndex: "content",
      key: "content"
    },
    {
      title: "上载人",
      dataIndex: "create_user",
      key: "create_user"
    },
    {
      title: "上载时间",
      dataIndex: "create_date",
      key: "create_date"
    },
    {
      title: "操作",
      key: "operation",
      render: (text, entry) => {
        const delTag =
          entry.create_user === user.name ? (
            <span>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除吗?"
                onConfirm={onDelete.bind(null, entry)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          ) : (
            ""
          );

        // const A = handleShowFeedback;
        return (
          <span>
            <a onClick={handleShowFeedback(entry)}>留言</a>
            <Divider type="vertical" />
            <a onClick={onDownload.bind(null, entry)}>下载</a>
            {delTag}
          </span>
        );
      }
    }
  ];

  const ItemTable = TypedTable<IAttchItem>();

  return (
    <div>
      <ItemTable
        size="middle"
        columns={columns}
        dataSource={list}
        rowKey="id"
      />
    </div>
  );
};

export default AttachList;
