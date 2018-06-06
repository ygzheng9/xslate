import * as React from "react";
import { HashRouter as Router, Link, Route, Switch } from "react-router-dom";

// 所有工号列表
// 一个工号的爆炸图
import { CategoryList, Explosion } from "./components/explosion";

// 订单管理
import { OrderMgmt } from "./components/orderDelivery";

// 多语言演示
import Intl from "./intlDemo";

// axios
// import PersonList from "./components/collections/dummy";

import ThreadMgmt from "./components/collections/threadsMgmt";

import "./App.css";

const App = () => (
  <Router>
    <div>
      <div className="znav">
        <Link to="/">爆炸图</Link>
        <Link to="/orderMgmt">发货单</Link>
        <Link to="/intl">多语言</Link>
        <Link to="/person">用户</Link>
      </div>

      <Switch>
        <Route exact={true} path="/" component={CategoryList} />
        <Route path="/explosion/:projectNo" component={Explosion} />
        <Route path="/orderMgmt" component={OrderMgmt} />
        <Route path="/intl" component={Intl} />
        <Route path="/person" component={ThreadMgmt} />

        <Route component={CategoryList} />
      </Switch>
    </div>
  </Router>
);

export default App;
