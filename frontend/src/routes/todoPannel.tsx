import * as React from "react";
import { MouseEventHandler } from "react";

import { connect } from "dva";

import {
  Breadcrumb,
  Button,
  Col,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Table,
  Tooltip
} from "antd";

import { ColumnProps } from "antd/lib/table";

import FontAwesome from "react-fontawesome";

import * as moment from "moment";

import AttachMgmt from "@components/attachments/attachMgmt";
import Feedback from "@components/feedback/feedbackMgmt";
import TodoMark from "@components/todos/todoMarker";

import todoService from "@services/todos";

import { IGlobalState, ILoginUser, MainModel } from "@models/types";

import { ITodoItem, OnInputChange } from "@components/types";

import { stringSorter } from "@utils/helper";

import "./todo.css";

const ButtonGroup = Button.Group;

// 顶部的工具栏，搜索用
interface ITopBarProps {
  paramCond: string;
  onParamCondChange: OnInputChange;
  onSearch: MouseEventHandler<HTMLElement>;
}
const TopBar: React.SFC<ITopBarProps> = props => {
  const { paramCond, onParamCondChange, onSearch } = props;

  return (
    <Row>
      <Col span={12}>
        <Input
          name="paramCond"
          placeholder="请输入搜索条件"
          value={paramCond}
          onChange={onParamCondChange}
        />
      </Col>
      <Col span={12}>
        <Button onClick={onSearch}>查询</Button>
      </Col>
    </Row>
  );
};

// 待办列表
type ItemFunc = (i: ITodoItem) => void;
interface ITodoListProps {
  items: ITodoItem[];
  user: ILoginUser;
  showMark: ItemFunc;
  findAttach: ItemFunc;
  onShowFeedback: ItemFunc;
}
const TodoList: React.SFC<ITodoListProps> = props => {
  const { items, user, showMark, findAttach, onShowFeedback } = props;
  const today = moment().format("YYYY-MM-DD");
  const neetwk = moment()
    .add(1, "days")
    .format("YYYY-MM-DD");

  const showMarkWrap = (record: ITodoItem) => () => showMark(record);
  const findAttachWrap = (record: ITodoItem) => () => findAttach(record);
  const showFeedbackWrap = (record: ITodoItem) => () => onShowFeedback(record);

  const columns: Array<ColumnProps<ITodoItem>> = [
    {
      title: "#",
      dataIndex: "seq_no",
      width: "15"
    },
    {
      title: "活动",
      dataIndex: "ref_title",
      width: "300"
    },
    {
      title: "工作描述",
      dataIndex: "content",
      width: "100",
      render: (text, record) => {
        // 只有责任人可以修改状态
        let modifyDom: JSX.Element = <div />;
        if (user.username === record.owner_name && record.status === "") {
          modifyDom = (
            <span>
              <a onClick={showMarkWrap(record)}>
                <FontAwesome name="flag" />
              </a>
            </span>
          );
        }

        let msgTag = text;
        const maxLength = 30;
        if (text.length >= maxLength) {
          msgTag = (
            <Tooltip title={text}>
              <span>{`${text.substring(0, maxLength - 1)}...`}</span>
            </Tooltip>
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
            {msgTag}
          </div>
        );
      }
    },
    {
      title: "责任人",
      dataIndex: "owner_name",
      sorter: (a, b) => stringSorter(a.owner_name, b.owner_name),
      width: "100",
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
      width: "100"
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "80"
    },
    {
      title: "实际完成时间",
      dataIndex: "actual_cmp_date",
      width: "150"
    },
    {
      title: "创建人",
      dataIndex: "create_user",
      width: "130"
    },
    {
      title: "创建时间",
      dataIndex: "create_date",
      width: "200"
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (text, record) => {
        const modifyDom = (
          <span>
            <a onClick={findAttachWrap(record)}>附件</a>
            <Divider type="vertical" />
            <a onClick={showFeedbackWrap(record)}>留言</a>
          </span>
        );

        return (
          <span>
            <ButtonGroup>{modifyDom}</ButtonGroup>
          </span>
        );
      }
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<ITodoItem> {}

  return (
    <div>
      <ItemTable
        size="middle"
        dataSource={items}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
};

// TodoPannel 登录后的首页，显示当前用户未完成的任务项
// 和 todoMgmt 非常相似，但是这里不能增删改todo，而且重在展现，所以单独做了

type ITodoPannelProps = ReturnType<typeof mapStateToProps>;
interface ITodoPannelStates {
  // todo 列表、当前todo
  items: ITodoItem[];
  item: ITodoItem;

  // 改变待办状态的 modal
  markerVisible: boolean;
  // 待办关联的附件
  attachVisible: boolean;

  // 顶部的查询条件
  paramCond: string;

  // 留言
  feedbackModal: boolean;
}

// tslint:disable-next-line:max-classes-per-file
class TodoPannel extends React.Component<ITodoPannelProps, ITodoPannelStates> {
  constructor(props: ITodoPannelProps) {
    super(props);

    // 默认显示全部，但是如果用户登录，则仅显示该用户
    const { user } = this.props;
    let initParam = "";
    if ("id" in user && user.id !== undefined && user.id > 0) {
      initParam = user.username;
    }

    this.state = {
      // todo 列表、当前todo
      items: [] as ITodoItem[],
      item: {} as ITodoItem,

      // 改变待办状态的 modal
      markerVisible: false,
      // 待办关联的附件
      attachVisible: false,

      // 顶部的查询条件
      paramCond: initParam,

      // 留言
      feedbackModal: false
    };
  }

  public componentDidMount() {
    this.onSearch();
  }

  // 查找当前父元素下的待办
  public onSearch = async () => {
    const tmp = {
      param: this.state.paramCond
    };
    const result = await todoService.queryByParam(tmp);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    // 为 items 增加序号
    const modified = data.items.map((item: any, idx: number) => ({
      ...item,
      seq_no: idx + 1
    }));

    this.setState({
      items: modified
    });
  };

  // 输入条件
  public onParamCondChange: OnInputChange = e => {
    const target = e.currentTarget;

    this.setState({
      paramCond: target.value
    });
  };

  // 显示完成确认框
  public showMark = (record: ITodoItem) => {
    this.setState({
      item: record,
      markerVisible: true
    });
  };

  // 隐藏完成确认框
  public hideMark = () => {
    this.setState({
      markerVisible: false
    });
  };

  // 标记完成
  public markTodo = async (entry: ITodoItem) => {
    const result = await todoService.mark(entry);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    this.onSearch();
    this.hideMark();
  };

  // 显示/隐藏 附件
  public hideAttach = () => {
    this.setState({
      attachVisible: false
    });
  };

  // 点击列表中的一行，根据点击的对象，显示 attach
  public findAttach = (entry: ITodoItem) => {
    // 设置附件的引用主对象，也即当前选中的元素
    this.setState({
      item: entry,
      attachVisible: true
    });
  };

  // 显示 feedback
  public showFeedback = (entry: ITodoItem) => {
    // 设置当前选中对象
    // 显示 feedback modal
    this.setState({
      item: entry,
      feedbackModal: true
    });
  };

  // 隐藏 feedback
  public hideFeedback = () => {
    this.setState({
      feedbackModal: false
    });
  };

  public render() {
    const { user } = this.props;
    const {
      items,
      item,
      markerVisible,
      attachVisible,
      paramCond,
      feedbackModal
    } = this.state;

    const hideAttach = this.hideAttach;

    const markProps = {
      item,
      visible: markerVisible,
      title: "关闭任务",
      onOk: this.markTodo,
      onCancel: this.hideMark
    };

    const attachProps = {
      // 根据当前 item，生成被引用的对象
      refItem: {
        ref_id: item.id,
        ref_type: "TODO",
        ref_title: item.content
      },
      goBack: hideAttach,
      user
    };

    // 列表的参数
    const listProps = {
      items,
      user,
      showMark: this.showMark,
      findAttach: this.findAttach,
      onShowFeedback: this.showFeedback
    };

    // feedback 只需要一个 prop: 该 feedback 的父元素，也即：当前元素
    const feedbackProps = {
      refItem: {
        ref_id: item.id,
        ref_type: "TODO",
        ref_title: item.content
      },
      user
    };

    // 列表顶部的工具栏
    const barProps: ITopBarProps = {
      paramCond,
      onParamCondChange: this.onParamCondChange,
      onSearch: this.onSearch
    };

    const listTag = (
      <div>
        <TopBar {...barProps} />
        <TodoList {...listProps} />
      </div>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>{"待办事项"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {!attachVisible && listTag}
          {markerVisible && <TodoMark {...markProps} />}
          {attachVisible && <AttachMgmt {...attachProps} />}

          {feedbackModal && (
            <Modal
              title={item.content.substring(0, 20)}
              style={{ top: 20 }}
              visible={feedbackModal}
              onOk={this.hideFeedback}
              onCancel={this.hideFeedback}
              footer={null}
            >
              <Feedback {...feedbackProps} />
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: IGlobalState) {
  const main = state[MainModel];

  return {
    user: main.user
  };
}

export default connect(mapStateToProps)(TodoPannel);
