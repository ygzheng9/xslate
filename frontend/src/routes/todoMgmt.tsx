import * as React from "react";

import { connect } from "dva";

import {
  Breadcrumb,
  Button,
  Col,
  Input,
  message,
  Modal,
  Row,
  Upload
} from "antd";

import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import Feedback from "@components/feedback/feedbackMgmt";
import TodoForm from "@components/todos/todoForm";
import TodoList from "@components/todos/todoList";
import TodoMark from "@components/todos/todoMarker";

import AttachMgmt from "@components/attachments/attachMgmt";

import eventService from "@services/event";
import todoService from "@services/todos";

import { IMarkorUser } from "@components/collections/types";
import { InputOnChange, IRefItem, ITodoItem } from "@components/types";
import { IGlobalState, MainModel } from "@models/types";
import { checkPermission } from "@utils/helper";

// 事件列表顶部的 搜索，查找，下载，新增，批量上载
interface ITodoTopBarProps {
  refItem: IRefItem;
  user: IMarkorUser;
  paramCond: string;
  onParamCondChange: InputOnChange;
  onSearch: () => void;
  onExport: () => void;
  onNew: () => void;
  goBack: () => void;
  doPublish: () => void;
}
const TodoTopBar: React.SFC<ITodoTopBarProps> = props => {
  const {
    refItem,
    user,
    paramCond,
    onParamCondChange,
    onSearch,
    onExport,
    onNew,
    goBack,
    doPublish
  } = props;

  const beforeUpload = () => true;

  const postData = { ...refItem, user_name: user.username };

  const uploadProps = {
    name: "file",
    data: postData,
    beforeUpload,
    action: "/api/todos_upload/",
    showUploadList: false,
    headers: {
      authorization: "authorization-text"
    },
    onChange(info: any) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上载完毕`);
        onSearch();
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上载失败.`);
      }
    }
  };

  return (
    <div>
      <Row>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a onClick={goBack}>工程变更 </a>{" "}
          </Breadcrumb.Item>
          <Breadcrumb.Item>{refItem.ref_title}</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
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
          <Button onClick={onExport}>导出</Button>
          {checkPermission("CreateEvent", user) && (
            <span>
              <Button onClick={onNew}>新建</Button>
              <Upload {...uploadProps}>
                <Button>上载</Button>
              </Upload>
              <Button onClick={doPublish}>发布</Button>
            </span>
          )}

          <Button onClick={goBack}>返回</Button>
        </Col>
      </Row>
    </div>
  );
};

// refItem 有两个:
// props 对应当前 todo 的父节点；
// state 其实是当前Todo，是给当前 todo 的子节点使用(feedback, attachments)
// 如果保留两个 refItem，那么太乱了，所以只保留 props 中，把 state 中去掉，因为：
//  state 中已经有当前元素 item 了，可以根据 item 计算出所需 refItem
interface ITodoMgmtProps extends ReturnType<typeof mapStateToProps> {
  refItem: IRefItem;
  goBack: () => void;
}

interface ITodoMgmtStates {
  // todo 列表、当前todo
  items: ITodoItem[];
  filteredItems: ITodoItem[];

  item: ITodoItem;
  modalVisible: boolean;
  modalType: "create" | "edit";

  // 改变待办状态的 modal
  markerVisible: boolean;
  // 待办关联的附件
  attachVisible: boolean;

  // 顶部的查询条件
  paramCond: string;

  // 留言
  feedbackModal: boolean;
}

class TodoMgmt extends React.Component<ITodoMgmtProps, ITodoMgmtStates> {
  private input = new Subject();
  private inputSubscription: any;

  constructor(props: ITodoMgmtProps) {
    super(props);

    // 创建一个 被观察对象
    // this.input = new Rx.Subject();

    this.state = {
      // todo 列表、当前todo
      items: [] as ITodoItem[],
      filteredItems: [] as ITodoItem[],

      item: {} as ITodoItem,
      modalVisible: false,
      modalType: "create",

      // 改变待办状态的 modal
      markerVisible: false,
      // 待办关联的附件
      attachVisible: false,

      // 顶部的查询条件
      paramCond: "",

      // 留言
      feedbackModal: false
    };
  }

  public componentDidMount() {
    // this.inputSubscription = this.input
    //   .debounceTime(300)
    //   .subscribe(this.onFilter);

    this.inputSubscription = this.input
      .pipe(debounceTime(300))
      .subscribe(this.onFilter);

    this.onSearch();
  }

  public componentWillUnmount() {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  // 根据用户输入，过滤的动作
  public onFilter = (val: string) => {
    // 客户端的模糊匹配：邮箱，收信人姓名，主题，内容；
    const remains = this.state.items.filter(
      itm =>
        itm.owner_name.indexOf(val) !== -1 ||
        itm.content.indexOf(val) !== -1 ||
        itm.memo.indexOf(val) !== -1
    );

    this.setState({
      filteredItems: remains
    });
  };

  // 输入条件
  public onParamCondChange: InputOnChange = e => {
    const target = e.currentTarget;

    this.setState({
      paramCond: target.value
    });
    this.input.next(target.value);
  };

  // 查找当前父元素下的待办
  public onSearch = async () => {
    // 如果 refItem 有值，queryByRef，否则 query
    const { refItem } = this.props;
    let apiRtn;
    if (refItem.ref_id === -1) {
      apiRtn = await todoService.query();
    } else {
      apiRtn = await todoService.queryByRef(refItem);
    }
    if ("err" in apiRtn) {
      return;
    }

    const { data } = apiRtn;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    this.setState({
      items: data.items
    });

    this.input.next(this.state.paramCond);
  };

  public onExport = () => {
    console.log("下载到本地....");
  };

  // 显示新增 modal
  public onNew = () => {
    this.setState({
      modalVisible: true,
      modalType: "create"
    });
  };

  // 显示修改的 modal
  public onEdit = (record: ITodoItem) => {
    this.setState({
      modalVisible: true,
      modalType: "edit",
      item: record
    });
  };

  // 新增、修改 modal 点击 取消
  public onCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  // 新增、修改 modal 点击 保存
  public onSave = async (entry: ITodoItem) => {
    const { user, refItem } = this.props;
    const param = entry;

    // 只有创建人能修改，修改人只能是创建人
    if (entry.id > 0) {
      // 更新
      param.update_user = user.username;
      param.create_user = user.username;
    } else {
      // 新增
      param.create_user = user.username;
    }

    // 设置当前元素的父节点
    param.ref_id = refItem.ref_id;
    param.ref_type = refItem.ref_type;
    param.ref_title = refItem.ref_title;

    const result = await todoService.save(param);
    if ("err" in result) {
      return;
    }
    const { data } = result;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    message.success("保存成功");

    this.onSearch();
    this.onCancel();
  };

  // 删除选中元素
  public onDelete = async (id: number) => {
    const result = await todoService.remove(id);
    if ("err" in result) {
      return;
    }
    const { data } = result;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    const remains = this.state.items.filter(itm => itm.id !== id);
    this.setState({
      items: remains,
      item: {} as ITodoItem
    });

    message.success("删除成功");
  };

  public doPublish = async () => {
    const { refItem } = this.props;
    console.log(refItem);

    const result = await eventService.notify(refItem.ref_id);
    if ("err" in result) {
      return;
    }
    const { data } = result;
    if (data.rtnCode !== 0) {
      message.error("通知发送失败");
      return;
    }

    message.success("通知发送成功");
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
    const { data } = result;
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
    const { refItem, goBack, user } = this.props;
    const {
      filteredItems,
      item,
      modalVisible,
      modalType,
      markerVisible,
      attachVisible,
      paramCond,
      feedbackModal
    } = this.state;

    const hideAttach = this.hideAttach;
    const onCancel = this.onCancel;
    const onSave = this.onSave;

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
      // items: items,
      items: filteredItems,
      user,
      onEdit: this.onEdit,
      onDelete: this.onDelete,
      showMark: this.showMark,
      findAttach: this.findAttach,
      onShowFeedback: this.showFeedback
    };

    let newItem = item;
    if (modalType === "create") {
      newItem = {} as ITodoItem;
      newItem.id = -1;
    }

    const modalProps = {
      item: newItem,
      visible: modalVisible,
      title: `${modalType === "create" ? "新建" : "修改"}`,
      onOk: onSave,
      onCancel
    };

    // 列表顶部的工具栏
    // refItem 是当前todo的父节点（props传入），也即：
    // 上载的所有todo，和当前todo是同一个父节点
    const barProps = {
      refItem,
      user,
      paramCond,
      onParamCondChange: this.onParamCondChange,
      onSearch: this.onSearch,
      onExport: this.onExport,
      onNew: this.onNew,
      goBack,
      doPublish: this.doPublish
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

    const listTag = (
      <div>
        <TodoTopBar {...barProps} />
        <TodoList {...listProps} />
      </div>
    );

    return (
      <div>
        {!attachVisible && !modalVisible && listTag}
        {modalVisible && <TodoForm {...modalProps} />}
        {markerVisible && <TodoMark {...markProps} />}
        {attachVisible && <AttachMgmt {...attachProps} />}

        {feedbackModal && (
          <Modal
            title={item.content}
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
    );
  }
}

function mapStateToProps(state: IGlobalState) {
  const main = state[MainModel];

  return {
    user: main.user
  };
}

export default connect(mapStateToProps)(TodoMgmt);
