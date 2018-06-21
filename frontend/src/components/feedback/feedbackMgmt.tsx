import * as React from "react";

import { Button, Col, Input, message, Row, Timeline } from "antd";

import * as _ from "lodash";

import { ILoginUser } from "@components/collections/types";

import feedbackSvc from "@services/feedback";

import {
  ButtonOnClick,
  IComment,
  IRefItem,
  TextareaOnChange
} from "@components/types";

const { TextArea } = Input;

// 用户互动的界面，对于一个元素，用户可以输入feedback；
// 上面是输入 feedback 的输入框，下面是所有 feedback 的列表；

// 上面输入 comment 的文本框+提交按钮
// 没有使用 form，但是是 受控组件
interface IFeedbackInputProps {
  comment: string;
  onCommentChange: TextareaOnChange;
  onCommentSave: ButtonOnClick;
}
const FeedbackInput: React.SFC<IFeedbackInputProps> = props => {
  const { comment, onCommentChange, onCommentSave } = props;

  return (
    <div>
      <Row>
        <Col>
          <TextArea rows={2} value={comment} onChange={onCommentChange} />
        </Col>
      </Row>
      <Row>
        <Col offset={21}>
          <Button onClick={onCommentSave}>留言</Button>
        </Col>
      </Row>
    </div>
  );
};

// 一条 comment 的展示
interface ICommentItemProps {
  item: IComment;
}
const CommentItem: React.SFC<ICommentItemProps> = props => {
  const { item } = props;
  return (
    <Timeline.Item>
      {item.create_date} - {item.create_user}: {item.comment}
    </Timeline.Item>
  );
};

// comment 列表的展示
interface ICommentItemsProps {
  items: IComment[];
}
const CommentItems: React.SFC<ICommentItemsProps> = props => {
  const { items } = props;
  const tag = items.map(i => <CommentItem item={i} key={i.id} />);

  return <Timeline>{tag}</Timeline>;
};

// Feedback 管理的组件
export interface IFeedbackMgmtProps {
  user: ILoginUser;
  refItem: IRefItem;
}

interface IFeedbackMgmtStates {
  comment: string;
  items: IComment[];
  refItem: any;
}

class FeedbackMgmt extends React.Component<
  IFeedbackMgmtProps,
  IFeedbackMgmtStates
> {
  constructor(props: IFeedbackMgmtProps) {
    super(props);

    this.state = {
      comment: "",
      items: [],
      refItem: this.props.refItem
    };
  }

  public componentDidMount() {
    this.onSearch();
  }

  // feedback 显示时，总有一个 refItem（父元素）
  // 查找父元素下所有的 feedback
  public onSearch = async () => {
    // 参数可以优化掉
    const refItem = this.state.refItem;

    const result = await feedbackSvc.queryByRef(refItem);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      console.log(refItem);
      message.error("数据错误");
    }

    // 设置列表，清空输入框
    this.setState({
      items: data.items,
      comment: ""
    });
  };

  // 保存 comment 逻辑
  public onCommentSave = async () => {
    // 保存当前
    if (this.state.comment.length <= 1) {
      message.error("你这也太简洁了吧");
      return;
    }

    // 每一个 feedback 都有父元素，这里是设置父元素
    const newOne = { comment: this.state.comment, ...this.state.refItem };
    newOne.create_user = this.props.user.username;

    const result = await feedbackSvc.save(newOne);
    if ("err" in result) {
      return;
    }

    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("数据错误");
    }

    this.onSearch();
  };

  // 输入框事件
  public onCommentChange = (e: any) => {
    const target = e.target;
    this.setState({ comment: target.value });
  };

  public render() {
    const { comment, items } = this.state;

    // 输入单笔 feedback 的 props
    const inputProps: IFeedbackInputProps = {
      comment,
      onCommentChange: this.onCommentChange,
      onCommentSave: this.onCommentSave
    };

    // feedback 列表
    const listProps: ICommentItemsProps = {
      items
    };

    return (
      <div>
        <div>
          <FeedbackInput {...inputProps} />
          {_.size(items) > 0 && <CommentItems {...listProps} />}
        </div>
      </div>
    );
  }
}

export default FeedbackMgmt;
