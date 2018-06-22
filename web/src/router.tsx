import * as React from "react";

import { Route, Router, Switch } from "dva/router";

import App from "./App";

// Threads & Message
import ThreadMgmt from "@components/collections/threadsMgmt";

// 商品管理
import ProductsMgmt from "@components/collections/productsMgmt";

// 用户管理
import UserMgmt from "@components/collections/userMgmt";

import LoginForm from "@components/login/loginForm";

import EventMgmt from "@routes/eventMgmt";
import TodoPannel from "@routes/todoPannel";

import LogMgmt from "@routes/logMgmt";

export default function({ history }: { history: any }) {
  return (
    <Router history={history}>
      <App>
        <Switch>
          <Route exact={true} path={`/`} component={ThreadMgmt} />

          <Route path={`/login`} component={LoginForm} />

          <Route path={`/threads`} component={ThreadMgmt} />

          <Route path={`/products`} component={ProductsMgmt} />

          <Route path={`/events`} component={EventMgmt} />

          <Route path={`/todos`} component={TodoPannel} />

          <Route path={`/users`} component={UserMgmt} />

          <Route path={`/logs`} component={LogMgmt} />

          <Route component={ThreadMgmt} />
        </Switch>
      </App>
    </Router>
  );
}
