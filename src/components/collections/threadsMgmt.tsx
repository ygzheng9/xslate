import * as React from "react";

import { Breadcrumb, Col, message, Row } from "antd";

import * as _ from "lodash";
import * as moment from "moment";

import OSS from "ali-oss";

import axios from "axios";

import "./markor.css";

import { IAPIMessage, IAPIThread } from "./types";

import "./threadsMgmt.css";

// Thread 层级浏览的导航栏
interface IViewPathProps {
  paths: IAPIThread[];
  clickNavItem: (t: IAPIThread) => () => void;
}

const ViewPath = ({ paths, clickNavItem }: IViewPathProps) => {
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

const RenderThread = ({
  threads,
  currThread,
  selectThread
}: IRenderThreadProps) => {
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
  client: any;
}

const RenderMessages = ({
  messages,
  currThread,
  client
}: IRenderMessagesProps) => {
  // 显示当前 thread 下的 messages
  const avlMessages = messages.filter(m => m.thread === currThread.id);
  const renderMessages = (m: IAPIMessage) => {
    let imgsTag: JSX.Element | JSX.Element[] = <div />;

    if (m.images !== undefined) {
      // 获取不重复的图片
      const allImgs = m.images.map(i => i.osspath);
      const distImgs = _.uniq(allImgs);

      imgsTag = distImgs.map(i => (
        <img key={i} className="preview" src={client.signatureUrl(i)} />
      ));
    }

    return (
      <Col span={6} key={m.objectId}>
        <div>
          <div className="message">
            <p>{`${m.text}`}</p>
            <p>{`${moment(m.created).toNow()} ${
              m.location ? m.location : ""
            }`}</p>
          </div>
          {imgsTag}
        </div>
      </Col>
    );
  };
  const messagesTag = avlMessages.map(renderMessages);
  return <Row>{messagesTag}</Row>;
};

// 浏览 Thread，以及其下的子目录，具体的 Messages
interface IThreadsMgmtStates {
  // 所有项目清单，项目是自包含的层级关系，objectaId 和 parentthread
  threads: IAPIThread[];

  // 浏览的目录，最后一个是当前选中的 Thread
  viewPath: IAPIThread[];

  // 所有 messages
  messages: IAPIMessage[];
}

class ThreadsMgmt extends React.Component<any, IThreadsMgmtStates> {
  public client: any;

  constructor(props: any) {
    super(props);

    // 建立 ali-oss 的客户端
    this.client = new OSS({
      accessKeyId: "LTAIJuSjXPx3B35m",
      accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
      region: "oss-cn-shanghai",
      bucket: "ordercommit"
    });

    // 设置一个属性为空的对象
    const naThread = {} as IAPIThread;
    const fullPath = [] as IAPIThread[];
    fullPath.push(naThread);

    this.state = {
      threads: [] as IAPIThread[],
      viewPath: fullPath,
      messages: [] as IAPIMessage[]
    };
  }

  public async componentDidMount() {
    // const { setLoadingInfo } = this.props;

    // setLoadingInfo(true, "加载中", "请稍后", "正在从服务器获取信息....");

    // 全部加载 Threads 和 Messages
    Promise.all([this.getThreads(), this.getMessages()]).then(
      ([res1, res2]) => {
        // 处理 threads
        const threads = res1.data.content[0].results as IAPIThread[];
        // flag = 0 代表有效项目
        const validThreads = threads.filter(t => t.flag === 0);

        // 处理 Messages
        const messages = res2.data.content[0].results as IAPIMessage[];
        // flag = 0 代表有效项目
        const validMessages = messages.filter(
          t => t.flag === 0 && t.documentType === "data"
        );

        this.setState({
          threads: validThreads,
          messages: validMessages
        });

        // setLoadingInfo(false);

        message.info("数据加载完毕");
      }
    );
  }

  // 获取“数据库”中的项目列表
  public getThreads = () => {
    const threadsUrl = `/Markor/adapters/Message/threads?offset=&limit=&timeStamp=0`;
    return axios.get(threadsUrl);
  };

  // 获取所有 message 信息
  public getMessages = () => {
    const messagesUrl = `/Markor/adapters/Message/messages?offset=&limit=&timeStamp=0`;
    return axios.get(messagesUrl);
  };

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
    const naThread = {} as IAPIThread;
    const fullPath = [] as IAPIThread[];
    fullPath.push(naThread);

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

  public render() {
    const { threads, messages, viewPath } = this.state;
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
      client: this.client
    };

    return (
      <div>
        <ViewPath {...viewPathProps} />
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          <RenderThread {...threadsProps} />
          <RenderMessages {...messagesProps} />
        </div>
      </div>
    );
  }
}

export default ThreadsMgmt;
