import * as React from "react";

import { Button, Divider, Icon, Popconfirm, Tooltip } from "antd";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as moment from "moment";

import { ITodoItem } from "@services/apiResults";
import { TypedColumn, TypedTable } from "@utils/shortcuts";

import { IAPILoginInfo } from "@components/collections/types";
import "@routes/todo.css";
import { stringSorter } from "@utils/helper";

const ButtonGroup = Button.Group;

interface ITodoListProps {
  items: ITodoItem[];
  user: IAPILoginInfo;
  onEdit: (a: ITodoItem) => void;
  onDelete: (id: number, msg: string) => void;
  showMark: (a: ITodoItem) => void;
  findAttach: (a: ITodoItem) => void;
  onShowFeedback: (a: ITodoItem) => void;
}
const TodoList: React.SFC<ITodoListProps> = props => {
  const {
    items,
    user,
    onEdit,
    onDelete,
    showMark,
    findAttach,
    onShowFeedback
  } = props;

  const today = moment().format("YYYY-MM-DD");
  const neetwk = moment()
    .add(1, "days")
    .format("YYYY-MM-DD");

  const showMarkWrap = (record: ITodoItem) => () => showMark(record);
  const onEditWrap = (record: ITodoItem) => () => onEdit(record);
  const onDeleteWrap = (id: number, msg: string) => () => onDelete(id, msg);
  const findAttachWrap = (record: ITodoItem) => () => findAttach(record);
  const onShowFeedbackWrap = (record: ITodoItem) => () =>
    onShowFeedback(record);

  const columns: TypedColumn<ITodoItem> = [
    {
      title: "#",
      dataIndex: "seq",
      width: "5%",
      render: (text, record, index) => <span>{index + 1}</span>
    },
    {
      title: "工作描述",
      dataIndex: "content",
      width: "25%",
      render: (text, record) => {
        // 只有责任人可以修改状态
        let modifyDom: JSX.Element = <div />;

        console.log(
          "user.name: ",
          user.name,
          " owner_name: ",
          record.owner_name
        );

        if (user.name === record.owner_name && record.status === "") {
          modifyDom = (
            <span>
              <a onClick={showMarkWrap(record)}>
                {/* <FontAwesomeIcon icon="flag" /> */}
                <Icon type="flag" />
              </a>
            </span>
          );
        }
        let flagClass = "todogray";
        if (record.status === "") {
          if (record.due_date < today) {
            flagClass = "todored";
          } else if (record.due_date < neetwk) {
            flagClass = "todoyellow";
          } else {
            flagClass = "todoblue";
          }
        }

        return (
          <div className={flagClass}>
            {modifyDom}
            &nbsp;
            {text}
          </div>
        );
      }
    },
    {
      title: "责任人",
      dataIndex: "owner_name",
      sorter: (a, b) => stringSorter(a.owner_name, b.owner_name),
      width: "8%",
      render: (text, record) => {
        let msgTag = text;
        if (record.memo.length > 0) {
          msgTag = (
            <Tooltip title={record.memo}>
              <span>{text}</span>
            </Tooltip>
          );
        }
        return msgTag;
      }
    },
    {
      title: "计划完成时间",
      dataIndex: "due_date",
      sorter: (a, b) => stringSorter(a.due_date, b.due_date),
      width: "10%"
    },
    {
      title: "状态",
      dataIndex: "status",
      filters: [
        { text: "完成", value: "完成" },
        { text: "取消", value: "取消" }
      ],
      onFilter: (value, record) => record.status === value,
      width: "5%"
    },
    {
      title: "实际完成时间",
      dataIndex: "actual_cmp_date",
      width: "10%"
    },
    {
      title: "创建人",
      dataIndex: "create_user",
      width: "6%"
    },
    {
      title: "创建时间",
      dataIndex: "create_date",
      width: "10%",
      render: text => {
        const tmp = text.substring(0, 10);
        return tmp;
      }
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (text, record) => {
        // 只有创建人可以修改，删除
        let modifyDom: JSX.Element = <div />;

        // 忽略掉 用户的 判定
        // user.name === record.create_user &&
        if (record.status === undefined || record.status === "") {
          modifyDom = (
            <span>
              <Divider type="vertical" />
              <a onClick={onEditWrap(record)}>
                {/* <FontAwesomeIcon icon="pencil" /> */}
                <Icon type="edit" />
              </a>
              <Divider type="vertical" />
              <Popconfirm
                title="确认要删除吗?"
                onConfirm={onDeleteWrap(record.id, "cancel")}
              >
                <a>
                  {/* <FontAwesomeIcon icon="trash" /> */}
                  <Icon type="delete" />
                </a>
              </Popconfirm>
            </span>
          );
        }

        return (
          <span>
            <ButtonGroup>
              <a onClick={findAttachWrap(record)}>附件</a>
              <Divider type="vertical" />
              <a onClick={onShowFeedbackWrap(record)}>留言</a>
              {modifyDom}
            </ButtonGroup>
          </span>
        );
      }
    }
  ];

  const ItemTable = TypedTable<ITodoItem>();

  return (
    <div>
      <ItemTable
        size="middle"
        dataSource={items}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
};

export default TodoList;
