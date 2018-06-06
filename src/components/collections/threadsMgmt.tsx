import * as React from "react";

import { Breadcrumb, Button, Col, message, Row } from "antd";

import * as _ from "lodash";
import * as moment from "moment";

import OSS from "ali-oss";

import axios from "axios";

import "./markor.css";

// 后台 API 返回的对象
interface IRtnObject {
  errors: IRtnError[];
  // 不同的 API 返回的 content 格式不同
  content: any[];
}

// 所有 API 返回的错误信息
interface IRtnError {
  statusCode: string;
  statusMessage: string;
}

// 登录 API 返回的具体内容
interface ILoginInfo {
  token: string;
  role: any[];
  roleName: any[];
  id: string;
  name: string;
}

// 项目，自递归的树形结构，objectID - parentthread
interface IThread {
  createdAt: string;
  objectId: string;
  updatedAt: string;
  tags: string;
  id: string;
  visibility: string;
  name: string;
  messages: any[];
  parentthread?: string;
  childthreads: any[];
  flag: number;
  employee?: string;
  subscriptions?: any[];
}

// 项目下的内容
interface IMessage {
  objectId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  topic: string;
  text: string;
  documentType: string;
  created: string;
  visibility: string;
  employee?: string;
  tags: string;
  location?: string;
  thread?: string;
  flag: number;
  subscriptions?: any[];
  images?: IImage[];
}

// 图片信息
interface IImage {
  localpath: string;
  osspath: string;
  type: string;
  modified: string;
  id: string;
  imageId: string;
  image?: any;
  height: number;
  width: number;
  parentEntity: string;
  flag: string;
}

// Thread 层级浏览的导航栏
interface IViewPathProps {
  paths: IThread[];
  clickNavItem: (t: IThread) => () => void;
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

  return <Breadcrumb>{itemTag}</Breadcrumb>;
};

// 显示当前选中 thread 的直接下级 threads
interface IRenderThreadProps {
  // 全部的 threads
  threads: IThread[];
  // 当前选中的 thread
  currThread: IThread;
  // 点击 thread 时触发
  selectThread: (thread: IThread) => () => void;
}

const RenderThread = ({
  threads,
  currThread,
  selectThread
}: IRenderThreadProps) => {
  // 由于 Threads 是自递归的树形关系，这里只显示一级；
  let avlThreads: IThread[];
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

  const threadsTag = avlThreads.map((t: IThread) => (
    <Col span={4} key={t.objectId} onClick={selectThread(t)}>
      {t.name}
    </Col>
  ));

  return <Row>{threadsTag}</Row>;
};

interface IRenderMessagesProps {
  messages: IMessage[];
  currThread: IThread;
  client: any;
}

const RenderMessages = ({
  messages,
  currThread,
  client
}: IRenderMessagesProps) => {
  // 显示当前 thread 下的 messages
  const avlMessages = messages.filter(m => m.thread === currThread.id);
  const renderMessages = (m: IMessage) => {
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
          <p>{`${m.text}`}</p>
          <p>{`${moment(m.created).toNow()} ${
            m.location ? m.location : ""
          }`}</p>
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
  threads: IThread[];

  // 浏览的目录，最后一个是当前选中的 Thread
  viewPath: IThread[];

  // 所有 messages
  messages: IMessage[];
}

class ThreadsMgmt extends React.Component<{}, IThreadsMgmtStates> {
  public client: any;

  constructor(props: {}) {
    super(props);

    // 建立 ali-oss 的客户端
    this.client = new OSS({
      accessKeyId: "LTAIJuSjXPx3B35m",
      accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
      region: "oss-cn-shanghai",
      bucket: "ordercommit"
    });

    // 设置一个属性为空的对象
    const naThread = {} as IThread;
    const fullPath = [] as IThread[];
    fullPath.push(naThread);

    this.state = {
      threads: [] as IThread[],
      viewPath: fullPath,
      messages: [] as IMessage[]
    };
  }

  // TODO: 增加 breadcramb ，每一个都是一个 thread
  // TODO: 增加 login，成功的话，获取 token，设置全局的 axios 头信息；失败的话，提示登录失败；
  // TODO: 目录显示，和文件显示，分成两行；

  // public componentDidMount() {}

  // 登录服务器，获取 token；在后续请求中，把 token 放到 headers.commom.Authorization 中
  public getLogin = () => {
    const loginUrl = "/Markor/adapters/Employee/login";

    // TODO: 替换成界面输入的用户名和密码
    const loginParam = {
      username: "ibmtest",
      password: "Mhf0131"
    };

    axios.post(loginUrl, loginParam).then(res => {
      // console.log(res);

      const data: IRtnObject = res.data as IRtnObject;

      if (data.errors[0].statusMessage !== "SUCCESS") {
        message.error("登录失败，请重试");
      } else {
        const loginInfo = res.data.content[0] as ILoginInfo;
        const token = loginInfo.token;
        // console.log("success: ", token);

        // 全局设置
        axios.defaults.headers.common.Authorization = token;

        message.success("登录成功");
      }
    });
  };

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

  public loadAllData = () => {
    // 全部加载 Threads 和 Messages
    Promise.all([this.getThreads(), this.getMessages()]).then(
      ([res1, res2]) => {
        // 处理 threads
        const threads = res1.data.content[0].results as IThread[];
        // flag = 0 代表有效项目
        const validThreads = threads.filter(t => t.flag === 0);

        // 处理 Messages
        const messages = res2.data.content[0].results as IMessage[];
        // flag = 0 代表有效项目
        const validMessages = messages.filter(
          t => t.flag === 0 && t.documentType === "data"
        );

        this.setState({
          threads: validThreads,
          messages: validMessages
        });

        message.info("数据加载完毕");
      }
    );
  };

  // 选中一个 Thread 后，进入下一级
  public selectThread = (thread: IThread) => () => {
    const { viewPath } = this.state;
    const newPath = [...viewPath];
    newPath.push(thread);

    this.setState({
      viewPath: [...newPath]
    });
  };

  // 清除当前选中的项目
  public clearCurrThread = () => {
    const naThread = {} as IThread;
    const fullPath = [] as IThread[];
    fullPath.push(naThread);

    this.setState({
      viewPath: fullPath
    });
  };

  public clickNavItem = (t: IThread) => () => {
    const { viewPath } = this.state;
    // 找到当前的点击的元素，并且删除掉其后的所有元素
    const idx = viewPath.findIndex(p => p.objectId === t.objectId);
    const remains = viewPath.filter((p, i) => i <= idx);

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
        <Button onClick={this.getLogin}> Login </Button>
        <Button onClick={this.loadAllData}> 加载数据 </Button>

        <ViewPath {...viewPathProps} />

        <hr />

        <RenderThread {...threadsProps} />
        <RenderMessages {...messagesProps} />
      </div>
    );
  }
}

export default ThreadsMgmt;
