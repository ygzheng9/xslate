import * as React from "react";

import { Badge, Button, List, Tag } from "antd";

import axios from "axios";

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

interface IPersonListStates {
  persons: any[];
  user: any;
  markor: any;
  threads: IThread[];
}

class PersonList extends React.Component<any, IPersonListStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      persons: [],
      user: {},
      markor: { content: { currentPage: -1 } },
      threads: [] as IThread[]
    };
  }

  public componentDidMount() {
    Promise.all([this.getPersons(), this.getUser()]).then(([persons, user]) => {
      this.setState({
        persons: persons.data,
        user: user.data
      });
    });
  }

  public getMarkor = () => {
    axios.defaults.headers.common.Authorization = `0F24F177C3B62DD6FA6F0F9DDAE92BE2A1808E52`;

    axios
      .get(`/Markor/adapters/Message/messages?offset=7&limit=50&timeStamp=0`)
      .then(res => {
        this.setState({
          markor: res.data
        });
      });
  };

  // 登录服务器，获取 token；在后续请求中，把 token 放到 headers.commom.Authorization 中
  public getLogin = () => {
    const loginUrl = "/Markor/adapters/Employee/login";
    const loginParam = {
      username: "ibmtest",
      password: "Mhf0131"
    };

    axios.post(loginUrl, loginParam).then(res => {
      console.log(res);
    });
  };

  // 获取“数据库”中的项目列表
  public getThreads = () => {
    axios.defaults.headers.common.Authorization = `46749310B16395F4AA57E4725082B55F6045FA92`;

    const threadsUrl = `/Markor/adapters/Message/threads?offset=&limit=&timeStamp=0`;

    axios.get(threadsUrl).then(res => {
      console.log(res);
      const threads = res.data.content[0].results as IThread[];
      const avl = threads.filter(t => t.flag === 0);
      console.log(avl);
      this.setState({
        threads: avl
      });
    });
  };

  public render() {
    const { user, threads, markor } = this.state;

    const renderThread = (thread: IThread) => (
      <List.Item>{thread.name}</List.Item>
    );

    return (
      <div>
        <Button onClick={this.getMarkor}> MHF </Button>
        {markor.content.currentPage}
        <hr />
        <Button onClick={this.getLogin}> Login </Button>
        <Button onClick={this.getThreads}> 项目 </Button>

        <hr />

        <List
          header={
            <div>
              <Badge
                count={109}
                overflowCount={100}
                style={{ backgroundColor: "#52c41a" }}
              >
                {user.userName}
              </Badge>
            </div>
          }
          footer={
            <div>
              <Tag color="magenta">{user.email}</Tag>
            </div>
          }
          bordered={true}
          dataSource={threads}
          renderItem={renderThread}
        />
      </div>
    );
  }

  private getPersons() {
    return axios.get(`https://jsonplaceholder.typicode.com/users`);
  }

  private getUser() {
    return axios.get(`/api/test`);
  }
}

export default PersonList;
