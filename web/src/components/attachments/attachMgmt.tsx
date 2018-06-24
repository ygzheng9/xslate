import * as React from "react";

import { Breadcrumb, message, Modal } from "antd";

import Feedback from "@components/feedback/feedbackMgmt";

import uploadSvc from "@services/uploads";

import AttachForm from "@components/attachments/attachForm";
import AttachList from "@components/attachments/attachList";

import { ILoginUser } from "@components/collections/types";
import { IFeedbackMgmtProps } from "@components/feedback/feedbackMgmt";

import { IAttchItem, IRefItem } from "@services/apiResults";
import { InputOnChange } from "@utils/shortcuts";

// 一个对象，比如：一个会议，一个待办等，都可以关联附件；
// 一个单独的页面，上面是上载按钮，下面是附件列表；
// 内部有状态

// AttachMgmt 是一个单独的页面，需要一个返回 goBack
// 附件都有一个 父元素 refItem；
// 当前用户 user
interface IAttachMgmtProps {
  goBack: () => void;
  refItem: IRefItem;
  user: ILoginUser;
  isPinned?: boolean;
  readOnly?: boolean;
}

interface IPostData extends IRefItem {
  content: string;
  create_user: string;
}

interface IAttachMgmtStates {
  // // 附件对应的主元素，作为属性，从父元素传入
  // refItem: this.props.refItem,

  // 主元素的附件列表
  list: IAttchItem[];

  // 当前选中的附件
  item: IAttchItem;

  // 上载附件的备注说明
  comment: string;

  // 上载附件时的附加信息
  postData: IPostData;

  // 留言
  feedbackModal: boolean;
}

class AttachMgmt extends React.Component<IAttachMgmtProps, IAttachMgmtStates> {
  constructor(props: IAttachMgmtProps) {
    super(props);

    this.state = {
      // // 附件对应的主元素，作为属性，从父元素传入
      // refItem: this.props.refItem,

      // 主元素的附件列表
      list: [] as IAttchItem[],

      // 当前选中的附件
      item: {} as IAttchItem,

      // 上载附件的备注说明
      comment: "",

      // 上载附件时的附加信息
      postData: {} as IPostData,

      // 留言
      feedbackModal: false
    };
  }

  // 直接访问 API
  // 查找 refItem 下所有附件
  public componentDidMount() {
    this.queryByRef();
  }

  // 按照附件ID，删除附件；
  public onDelete = async (entry: IAttchItem) => {
    // 从数据后删除
    const result = await uploadSvc.remove(entry.id);
    if ("err" in result) {
      return;
    }

    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作失败");
      return;
    }

    // 从列表中删除
    const remains = this.state.list.filter(itm => itm.id !== entry.id);
    this.setState({ list: remains });

    message.info("删除完毕");
  };

  // 列表操作：下载一个附件
  public onDownload = (entry: IAttchItem) => {
    // 下载文件
    uploadSvc.downloadFile(entry.id);
  };

  // 上载附件时输入备注的文本框
  public onCommentChange: InputOnChange = e => {
    const target = e.currentTarget;
    this.setState({ comment: target.value });
  };

  // 按照 refItem，查找附件
  public queryByRef = async () => {
    const refItem = this.props.refItem;
    const result = await uploadSvc.queryByRef(refItem);
    if ("err" in result) {
      return;
    }
    const data = result.data;
    if (data.rtnCode !== 0) {
      message.error("操作错误");
      return;
    }

    this.setState({ list: data.items });
  };

  // 上载前的校验
  public beforeUpload = () => {
    const { refItem, user } = this.props;
    const { postData } = this.state;

    // 取得用户输入的信息
    postData.content = this.state.comment;

    // 设置参考信息
    postData.ref_id = refItem.ref_id;
    postData.ref_type = refItem.ref_type;
    postData.ref_title = refItem.ref_title;
    postData.create_user = user.username;

    this.setState({ postData });

    // 返回 true 继续，false 终止
    return true;
  };

  // 上载完毕后，更新附件列表
  public postUpload = () => {
    // 清空数据
    this.setState({
      comment: "",
      postData: {} as IPostData
    });

    // 重新加载列表
    this.queryByRef();
  };

  // 显示 feedback
  public showFeedback = (entry: IAttchItem) => {
    // 设置当前选中对象
    // 显示 feedback modal
    this.setState({
      item: entry,
      feedbackModal: true
    });
  };

  // 隐藏 feedback
  public hideFeedback = () => {
    this.setState({ feedbackModal: false });
  };

  public render() {
    const { refItem, goBack, user, isPinned, readOnly } = this.props;
    const { list, item, comment, postData, feedbackModal } = this.state;

    // 上载附件的 form
    const formProps = {
      comment,
      onCommentChange: this.onCommentChange,
      postData,
      uploadAction: "/api/uploads/",
      beforeUpload: this.beforeUpload,
      postUpload: this.postUpload,
      goBack,
      isPinned
    };

    // 附件列表
    const listProps = {
      list,
      onDownload: this.onDownload,
      onDelete: this.onDelete,
      user,
      onShowFeedback: this.showFeedback
    };

    // feedback 只需要一个 prop: 该 feedback 的父元素，也即：当前元素
    const feedbackProps: IFeedbackMgmtProps = {
      user,
      refItem: {
        ref_id: item.id,
        ref_type: "ATTACH",
        ref_title: item.file_name
      }
    };

    // 如果是始终显示的，那么不显示顶部导航
    const bdTag = isPinned ? (
      ""
    ) : (
      <Breadcrumb>
        <Breadcrumb.Item>
          <a onClick={goBack}>{refItem.ref_title}</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>附件</Breadcrumb.Item>
      </Breadcrumb>
    );

    // 如果是只读，那么不显示上载的功能
    const formTag = readOnly ? "" : <AttachForm {...formProps} />;

    // 如果有附件，再显式列表
    const listTag = list.length > 0 ? <AttachList {...listProps} /> : "";

    return (
      <div>
        {bdTag}

        {formTag}

        {listTag}

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
    );
  }
}

export default AttachMgmt;
