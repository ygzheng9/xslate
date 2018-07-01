import * as React from "react";

import * as moment from "moment";

import {
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Input,
  message,
  Modal,
  Row,
  Select
} from "antd";

import { connect } from "dva";

import AttachMgmt from "@components/attachments/attachMgmt";
import EventForm from "@components/events/eventForm";
import EventList, { IEventListProps } from "@components/events/eventList";
import Feedback from "@components/feedback/feedbackMgmt";
import Todo from "@components/todos/todoMgmt";

import eventService from "@services/event";

import { IAPILoginInfo } from "@components/collections/types";
import { IGlobalState, MainModel } from "@models/types";

import { checkPermission, dateFormat } from "@utils/helper";

import { IBizEvent, IRefItem, RefItemOp } from "@services/apiResults";

import {
  ButtonOnClick,
  DateRangeOnChange,
  InputOnChange,
  RangeValue,
  SelectOnChange,
  SelectValue
} from "@utils/shortcuts";

const InputGroup = Input.Group;
const Option = Select.Option;

const { RangePicker } = DatePicker;

// 事件列表顶部的 搜索，查找，下载，新增
interface IEventTopBarProps {
  paramCond: string;
  paramStatus: SelectValue;
  paramRange: RangeValue;
  onParamCondChange: InputOnChange;
  onParamStatusChange: SelectOnChange;
  onParamRangeChange: DateRangeOnChange;
  onSearch: ButtonOnClick;
  onExport: ButtonOnClick;
  onNew: ButtonOnClick;
  user: IAPILoginInfo;
}

const EventTopBar: React.SFC<IEventTopBarProps> = props => {
  const {
    paramCond,
    paramStatus,
    paramRange,
    onParamCondChange,
    onParamStatusChange,
    onParamRangeChange,
    onSearch,
    onExport,
    onNew,
    user
  } = props;

  return (
    <Row>
      <Col span={6}>
        <RangePicker
          value={paramRange}
          format={dateFormat}
          onChange={onParamRangeChange}
        />
      </Col>
      <Col span={6}>
        <InputGroup>
          <Select
            style={{ width: "40%" }}
            value={paramStatus}
            onChange={onParamStatusChange}
          >
            <Option value="OPEN">未关闭</Option>
            <Option value="CLOSED">已关闭</Option>
            <Option value="ALL">全部</Option>
          </Select>

          <Input
            style={{ width: "60%" }}
            name="paramCond"
            placeholder="请输入搜索条件"
            value={paramCond}
            onChange={onParamCondChange}
          />
        </InputGroup>
      </Col>
      <Col span={8}>
        <Button onClick={onSearch}>查询</Button>
        <Button onClick={onExport}>导出</Button>
        {checkPermission("CreateEvent", user) && (
          <Button onClick={onNew}>新建</Button>
        )}
      </Col>
    </Row>
  );
};

// 事件管理的主组件

// event 没有父节点，只需要当前 user 即可
type IEventMgmtProps = ReturnType<typeof mapStateToProps>;

interface IEventMgmtStates {
  items: IBizEvent[];
  item: IBizEvent;
  modalVisible: boolean;
  modalType: "create" | "edit";
  modalReadOnly: boolean;

  // 是个 adapter，是当前元素，作为子元素的父节点
  refItem: IRefItem;
  // 待办事项是否显示
  todoVisible: boolean;
  // 附件上载是否显示
  attachVisible: boolean;

  // 查询条件
  paramCond: string;
  paramRange: RangeValue;
  paramStatus: SelectValue;

  // 留言
  feedbackModal: boolean;
}

class EventMgmt extends React.Component<IEventMgmtProps, IEventMgmtStates> {
  constructor(props: IEventMgmtProps) {
    super(props);

    const end = moment().add(1, "days");
    const start = moment().add(-1, "years");

    this.state = {
      items: [] as IBizEvent[],
      item: {} as IBizEvent,
      modalVisible: false,
      modalType: "create",
      modalReadOnly: false,

      // 是个 adapter，是当前元素，作为子元素的父节点
      refItem: {} as IRefItem,
      // 待办事项是否显示
      todoVisible: false,
      // 附件上载是否显示
      attachVisible: false,

      // 查询条件
      paramCond: "",
      paramRange: [start, end],
      paramStatus: "OPEN",

      // 留言
      feedbackModal: false
    };
  }

  public componentDidMount() {
    this.onSearch();
  }

  // 输入条件
  public onParamCondChange: InputOnChange = e => {
    const target = e.currentTarget;

    this.setState({
      paramCond: target.value
    });
  };

  public onParamStatusChange: SelectOnChange = value => {
    this.setState({
      paramStatus: value
    });
  };

  public onParamRangeChange: DateRangeOnChange = (range: RangeValue) => {
    this.setState({
      paramRange: range
    });
  };

  // 显示新增的 modal
  public onNew = () => {
    // 隐藏 list 显示 form
    this.setState({
      item: {} as IBizEvent,
      modalVisible: true,
      modalType: "create"
    });
  };

  // 显示修改的 modal
  public onUpdate: IEventListProps["onUpdate"] = (data, readOnly) => {
    this.setState({
      item: data,
      modalVisible: true,
      modalType: "edit",
      modalReadOnly: readOnly || false
    });
  };

  public onDelete: IEventListProps["onDelete"] = async id => {
    // 从数据库删除
    const result = await eventService.remove(id);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    // 从列表删除
    const remains = this.state.items.filter(itm => itm.id !== id);
    this.setState({
      items: remains
    });

    message.success("删除成功");
  };

  public onSearch = async () => {
    const state = this.state;
    const param = {
      cond: state.paramCond,
      status: state.paramStatus,
      start_dt: state.paramRange[0].format(dateFormat),
      end_dt: state.paramRange[1].format(dateFormat)
    };
    const result = await eventService.searchByParam(param);
    if ("err" in result) {
      return;
    }

    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    const modified = (data.items as IBizEvent[]).map((i, idx) => ({
      seq_no: idx + 1,
      ...i
    }));

    this.setState({
      items: modified,
      todoVisible: false
    });
  };

  // 导出列表
  public onExport = () => {
    console.log("导出查询结果到本地");
  };

  public onOk = async (item: IBizEvent) => {
    const result = await eventService.save(item);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    this.onSearch();
    this.onCancel();
  };

  // 隐藏 modal
  public onCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  // 关闭该事件
  public onCloseEvent: IEventListProps["onCloseEvent"] = async eventid => {
    const result = await eventService.closeEvent(eventid);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败，请重试");
      return;
    }

    this.onSearch();
    message.success("操作成功");
  };

  // todo 切换：显示/隐藏
  public hideTodo = () => {
    this.setState({
      todoVisible: false
    });
  };

  // 点击列表中的一行，根据点击的对象，显示TODO
  public showTodo: RefItemOp = item => {
    // 设置 父节点, 显示 todoModal
    this.setState({
      refItem: item,
      todoVisible: true
    });
  };

  // 附件切换：隐藏
  public hideAttach = () => {
    this.setState({
      attachVisible: false
    });
  };

  // 点击列表中的一行，根据点击的对象，显示 upload
  public showAttach: RefItemOp = item => {
    // 设置引用的主对象
    this.setState({
      refItem: item,
      attachVisible: true
    });
  };

  // 显示 feedback
  public showFeedback = (item: IBizEvent) => {
    // 设置当前选中对象
    const refItem = {
      ref_id: item.id,
      ref_type: "Event",
      ref_title: item.subject
    };

    // 显示 feedback modal
    this.setState({
      feedbackModal: true,
      refItem
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
      modalVisible,
      modalType,
      modalReadOnly,
      todoVisible,
      attachVisible,
      refItem,
      paramCond,
      feedbackModal
    } = this.state;

    const state = this.state;

    const listProps: IEventListProps = {
      items,
      // onNew: this.onNew,
      onUpdate: this.onUpdate,
      onDelete: this.onDelete,
      showTodo: this.showTodo,
      showAttach: this.showAttach,
      user,
      onShowFeedback: this.showFeedback,
      onCloseEvent: this.onCloseEvent
    };

    const modalProps = {
      user,
      item,
      modalType,
      readOnly: modalReadOnly,
      onOk: this.onOk,
      onCancel: this.onCancel
    };

    const hideTodo = this.hideTodo;
    const hideAttach = this.hideAttach;

    // 待办的参数
    const todoProps = {
      refItem,
      goBack: () => {
        hideTodo();
        this.onSearch();
      },
      user
    };

    // 上载附件的参数
    const attachProps = {
      refItem,
      goBack: () => hideAttach(),
      user
    };

    // feedback 只需要一个 prop
    const feedbackProps = {
      user,
      refItem
    };

    // 列表顶部的工具栏
    const barProps = {
      paramCond,
      paramRange: state.paramRange,
      paramStatus: state.paramStatus,

      onParamCondChange: this.onParamCondChange,
      onParamStatusChange: this.onParamStatusChange,
      onParamRangeChange: this.onParamRangeChange,

      onSearch: this.onSearch,
      onExport: this.onExport,
      onNew: this.onNew,
      user
    };

    const listTag = (
      <div>
        <EventTopBar {...barProps} />
        <EventList {...listProps} />
      </div>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>{"商品计划"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {!attachVisible && !todoVisible && !modalVisible && listTag}
          {modalVisible && <EventForm {...modalProps} />}
          {todoVisible && <Todo {...todoProps} />}
          {attachVisible && <AttachMgmt {...attachProps} />}

          {feedbackModal && (
            <Modal
              title="留言信息"
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

export default connect(mapStateToProps)(EventMgmt);
