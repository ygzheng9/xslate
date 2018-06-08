// tslint:disable:no-var-requires

import dva from "dva";

import { message } from "antd";

import { createLogger } from "redux-logger";

import createLoading from "dva-loading";

import "antd/dist/antd.css";
import "./index.css";

import count from "./models/count";
import appData from "./models/markorApp";

import start from "./routes/start";

import registerServiceWorker from "./registerServiceWorker";

import * as moment from "moment";

// 推荐在入口文件全局设置 locale
import "moment/locale/zh-cn";

moment.locale("zh-cn");

const middlewares = [];

if (process.env.NODE_ENV === "development") {
  middlewares.push(
    createLogger({
      predicate: (getState: any, action: any) =>
        action.type.indexOf("@@DVA_LOADING") === -1
    })
  );
}

const app = dva({
  initialState: {},

  onAction: middlewares,

  // dva 里，effects 和 subscriptions 的抛错全部会走 onError hook
  onError(err) {
    console.log(err);
    message.error("喝杯茶休息一下吧。");
  }
});

app.use(createLoading());

app.model(count as any);
app.model(appData as any);
app.router(start as any);
app.start("#root");

registerServiceWorker();
