import * as React from "react";

import { Breadcrumb, Button, Carousel, Col, message, Modal, Row } from "antd";

import { connect } from "dva";

import * as _ from "lodash";
import * as moment from "moment";

import "./collections.css";

import { IAPIMessage, IAPIThread } from "@components/collections/types";
import { IGlobalState, LoadThreads, MainModel } from "@models/types";
import { ZActionType } from "@utils/shortcuts";

// Thread 层级浏览的导航栏
interface IViewPathProps {
  paths: IAPIThread[];
  clickNavItem: (t: IAPIThread) => () => void;
}
const ViewPath: React.SFC<IViewPathProps> = props => {
  const { paths, clickNavItem } = props;

  const itemTag = paths.map(p => {
    if (_.isEmpty(p)) {
      return (
        <Breadcrumb.Item key={-1}>
          <a onClick={clickNavItem(p)}>{"全部"}</a>
        </Breadcrumb.Item>
      );
    } else {
      return (
        <Breadcrumb.Item key={p.objectId}>
          <a onClick={clickNavItem(p)}>{p.name}</a>
        </Breadcrumb.Item>
      );
    }
  });

  return <Breadcrumb style={{ margin: "16px 0" }}>{itemTag}</Breadcrumb>;
};

// 显示当前选中 thread 的直接下级 threads
interface IRenderThreadProps {
  // 全部的 threads
  threads: IAPIThread[];
  // 当前选中的 thread
  currThread: IAPIThread;
  // 点击 thread 时触发
  selectThread: (thread: IAPIThread) => () => void;
}
const RenderThread: React.SFC<IRenderThreadProps> = props => {
  const { threads, currThread, selectThread } = props;

  // 由于 Threads 是自递归的树形关系，这里只显示一级；
  let avlThreads: IAPIThread[];
  if (_.isEmpty(currThread)) {
    // 从返回的数据分析，有这三种可能性
    avlThreads = threads.filter(
      t =>
        !t.parentthread || t.parentthread === undefined || t.parentthread === ""
    );
  } else {
    avlThreads = threads.filter(t => t.parentthread === currThread.objectId);
  }

  // 按 createAt 排序
  avlThreads = avlThreads.sort(
    (a, b) =>
      a.createdAt === b.createdAt ? 0 : a.createdAt < b.createdAt ? 1 : -1
  );

  const threadsTag = avlThreads.map((t: IAPIThread) => (
    <Col span={4} key={t.objectId} onClick={selectThread(t)}>
      <div className="thread">{t.name}</div>
    </Col>
  ));

  return <Row>{threadsTag}</Row>;
};

interface IRenderMessagesProps {
  messages: IAPIMessage[];
  currThread: IAPIThread;
  getMessageImgCount: (m: IAPIMessage) => number;
  selectMessage: (m: IAPIMessage) => () => void;
}
const RenderMessages: React.SFC<IRenderMessagesProps> = props => {
  const { messages, currThread, getMessageImgCount, selectMessage } = props;
  // 显示当前 thread 下的 messages
  const avlMessages = messages.filter(m => m.thread === currThread.id);

  const renderMessages = (m: IAPIMessage) => {
    const imgCount = getMessageImgCount(m);

    return (
      <Col span={6} key={m.objectId}>
        <div className="message" onClick={selectMessage(m)}>
          <div>{`${m.text}`}</div>
          <div>{`照片：${imgCount} 张`}</div>
          <div>{`${moment(m.created).toNow()} ${
            m.location ? m.location : ""
          }`}</div>
        </div>
      </Col>
    );
  };
  const messagesTag = avlMessages.map(renderMessages);
  return <Row>{messagesTag}</Row>;
};

// 浏览 Thread，以及其下的子目录，具体的 Messages\
const getEmptyList = () => {
  // 设置一个属性为空的对象
  const naThread = {} as IAPIThread;
  const fullPath = [] as IAPIThread[];
  fullPath.push(naThread);
  return fullPath;
};

const threadsMgmtStates = {
  // 浏览的目录，最后一个是当前选中的 Thread
  viewPath: getEmptyList(),

  // pic modal
  picModal: false,
  currMessage: {} as IAPIMessage
};

type IThreadsMgmtStates = typeof threadsMgmtStates;

class ThreadsMgmt extends React.Component<any, IThreadsMgmtStates> {
  public client: any;

  constructor(props: any) {
    super(props);

    this.state = threadsMgmtStates;
  }

  // 选中一个 Thread 后，进入下一级
  public selectThread = (thread: IAPIThread) => () => {
    const { viewPath } = this.state;
    const newPath = [...viewPath];
    newPath.push(thread);

    this.setState({
      viewPath: [...newPath]
    });
  };

  // 清除当前选中的项目
  public clearCurrThread = () => {
    const fullPath = getEmptyList();

    this.setState({
      viewPath: fullPath
    });
  };

  public clickNavItem = (t: IAPIThread) => () => {
    const { viewPath } = this.state;
    // 找到当前的点击的元素，并且删除掉其后的所有元素
    const idx = viewPath.findIndex(p => p.objectId === t.objectId);
    const remains = viewPath.filter((v, i) => {
      v = v;
      return i <= idx;
    });

    this.setState({
      viewPath: [...remains]
    });
  };

  // 关闭 message 的 pic modal
  public closeMessagePic = () => {
    this.setState({
      picModal: false
    });
  };

  public selectMessage = (m: IAPIMessage) => () => {
    const picCnt = this.getMessageImgCount(m);
    if (picCnt === 0) {
      message.warning("未提供照片");
      return;
    }

    this.setState({
      picModal: true,
      currMessage: m
    });
  };

  // 取得 Message 的图片数量
  public getMessageImgCount = (m: IAPIMessage) => {
    let imgCount = 0;
    if (m.images !== undefined) {
      // 获取不重复的图片
      const allImgs = m.images.map(i => i.osspath);
      const distImgs = _.uniq(allImgs);

      imgCount = _.size(distImgs);
    }
    return imgCount;
  };

  // 获取当前 message 的 img tag
  public getMessageImgs = () => {
    const m = this.state.currMessage;
    const { client } = this.props;

    if (m.images !== undefined) {
      // 获取不重复的图片
      const allImgs = m.images.map(i => i.osspath);
      const distImgs = _.uniq(allImgs);

      const imgsTag = distImgs.map(i => (
        <div key={i}>
          <img key={i} className="modalPic" src={client.signatureUrl(i)} />
        </div>
      ));
      return imgsTag;
    }
    return "";
  };

  public render() {
    const { threads, messages } = this.props;
    const { viewPath } = this.state;
    const currThread = viewPath[viewPath.length - 1];

    // 显示浏览路径
    const viewPathProps: IViewPathProps = {
      paths: viewPath,
      clickNavItem: this.clickNavItem
    };

    const threadsProps: IRenderThreadProps = {
      threads,
      currThread,
      selectThread: this.selectThread
    };

    const messagesProps: IRenderMessagesProps = {
      messages,
      currThread,
      getMessageImgCount: this.getMessageImgCount,
      selectMessage: this.selectMessage
    };

    const btnTitle = "数据未加载，点击加载";

    const modal1 = (
      <Modal
        title="数据库"
        visible={this.state.picModal}
        onCancel={this.closeMessagePic}
        footer={null}
      >
        <Carousel>{this.getMessageImgs()}</Carousel>
      </Modal>
    );

    return (
      <div>
        <ViewPath {...viewPathProps} />
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {threads.length === 0 && (
            <Button onClick={this.props.loadAllData}>{btnTitle}</Button>
          )}
          <RenderThread {...threadsProps} />
          <RenderMessages {...messagesProps} />
          {this.state.picModal && modal1}
        </div>
      </div>
    );
  }
}

function mapStateToProps(store: IGlobalState) {
  const main = store[MainModel];

  const { threads, messages, client } = main;

  return {
    threads,
    messages,
    client
  };
}

// 把 dispatch 映射到组件的属性，这样组件中就可以不出现 dispatch 了
// 注意，这里定义的都是 func，而不是一个 dispatch 调用；
function mapDispatchToProps(dispatch: any) {
  return {
    // 根据 ref 查找变更记录
    loadAllData: () => {
      dispatch({
        type: ZActionType(MainModel, LoadThreads)
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadsMgmt);
