import * as React from "react";

import { HashRouter as Router, Link, Route, Switch } from "react-router-dom";

import { connect } from "dva";

import { Layout, Menu } from "antd";
import { ClickParam } from "antd/lib/menu";

const { Header, Content, Footer } = Layout;

import "./markorLayout.css";

// Threads & Message
import ThreadMgmt from "../collections/threadsMgmt";

// 商品管理
import ProductsMgmt from "../collections/productsMgmt";

// 用户管理
import UserMgmt from "../collections/userMgmt";

class MarkorLayout extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = { selectedKeys: ["1"] };
  }

  public clickMenu = (param: ClickParam) => {
    console.log("clicked: ", param);

    const keys = [param.key];
    this.setState({
      selectedKeys: keys
    });
  };

  public render() {
    const { selectedKeys } = this.state;
    const { user, logout } = this.props;

    return (
      <Layout>
        <Header
          style={{ padding: 0, position: "fixed", zIndex: 1, width: "100%" }}
        >
          <div className="markorLayoutLogo">
            <img style={{ width: 100, height: 30 }} src="/pic/MHF.png" />
          </div>

          <div className="markorLogout">
            {`${user.username}    `}
            <a onClick={logout}>退出</a>
          </div>

          <Menu
            theme="light"
            mode="horizontal"
            onClick={this.clickMenu}
            selectedKeys={selectedKeys}
            style={{ lineHeight: "64px" }}
          >
            <Menu.Item key="1">
              <Link to={`/threads`}>数据库</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to={`/products`}>商品</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to={`/users`}>用户</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 64 }}>
          <Router>
            <Switch>
              <Route path={`/threads`} component={ThreadMgmt} />

              <Route path={`/products`} component={ProductsMgmt} />

              <Route path={`/users`} component={UserMgmt} />

              <Route component={ThreadMgmt} />
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

function mapStateToProps(store: any) {
  const { markorApp } = store;
  const { user } = markorApp;

  return {
    user
  };
}

function mapDispatchToProps(dispatch: any) {
  return {
    // 根据 ref 查找变更记录
    logout: () => {
      dispatch({
        type: "markorApp/logout"
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MarkorLayout);
