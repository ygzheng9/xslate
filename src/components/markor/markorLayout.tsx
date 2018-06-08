import * as React from "react";

import {
  HashRouter as Router,
  Link,
  Route,
  Switch,
  withRouter
} from "react-router-dom";

import { Layout, Menu } from "antd";
const { Header, Content, Footer } = Layout;

import "./markorLayout.css";

// Threads & Message
import ThreadMgmt from "../collections/threadsMgmt";

// 商品管理
import ProductsMgmt from "../collections/productsMgmt";

class MarkorLayout extends React.Component<any> {
  public render() {
    const { match, setLoadingInfo, isLogin } = this.props;

    const threadProps = {
      setLoadingInfo,
      isLogin
    };

    const Threads = () => <ThreadMgmt {...threadProps} />;

    return (
      <Layout>
        <Header
          style={{ padding: 0, position: "fixed", zIndex: 1, width: "100%" }}
        >
          <div className="markorLayoutLogo">
            <img style={{ width: 100, height: 30 }} src="/pic/MHF.png" />
          </div>

          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            style={{ lineHeight: "64px" }}
          >
            <Menu.Item key="1">
              <Link to={`${match.url}/threads`}>项目</Link>
            </Menu.Item>
            <Menu.Item key="2">数据库</Menu.Item>
            <Menu.Item key="3">
              <Link to={`${match.url}/products`}>项目</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 64 }}>
          <Router>
            <Switch>
              <Route path={`${match.url}/threads`} component={Threads} />

              <Route path={`${match.url}/products`} component={ProductsMgmt} />

              <Route exact={true} path={match.url} component={ThreadMgmt} />
              <Route component={Threads} />
            </Switch>
          </Router>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          环球笔记 ©2018 Created by IBM
        </Footer>
      </Layout>
    );
  }
}

export default withRouter(MarkorLayout);
