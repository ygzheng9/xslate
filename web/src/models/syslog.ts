import {
  IGlobalState,
  ISysState,
  LoadData,
  LogModel,
  UpdateState
} from "@models/types";

import {
  EffectsCommandMap,
  Model,
  SubscriptionAPI,
  ZDvaAction
} from "@utils/shortcuts";

import { ISysLog } from "@services/apiResults";

import * as moment from "moment";

import { IAPILoginInfo } from "@components/collections/types";
import logSvc from "@services/syslog";

const end = moment().add(1, "days");
const start = moment().add(-2, "months");

const sysState: ISysState = {
  logs: [] as ISysLog[],
  paramCond: "",
  paramRange: [start, end]
};

const model: Model = {
  namespace: LogModel,
  state: sysState,

  reducers: {
    [UpdateState](state: ISysState, action: ZDvaAction) {
      return { ...state, ...action.payload };
    }
  },

  effects: {
    // 对于需要在外部访问的方法，统一采用常量作为方法名
    *[LoadData](action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, call } = effects;

      const result = yield call(logSvc.queryByParam, action.payload);

      yield put({
        type: UpdateState,
        payload: {
          logs: result.data.items
        }
      });

      // 写日志
      // const { user }: { user: IAPILoginInfo } = yield select(
      //   (state: any) => state.main
      // );
      // const p: Partial<ISysLog> = {
      //   username: user.name,
      //   func: "查看日志信息"
      // };
      // yield call(logSvc.log, p);
    },

    // 只在本 model 内部使用，不需要在外部访问
    *reloadLogs(action: ZDvaAction, effects: EffectsCommandMap) {
      const { put, select } = effects;
      // 取得当前 logs，如果为空，再加载，否则，什么都不做
      const logs = yield select((state: IGlobalState) => state[LogModel].logs);
      if (logs.length === 0) {
        // console.log("reload logs....");

        yield put({
          type: LoadData
        });
      }
    },

    *log({ payload }, { select, call }) {
      // 写日志
      const { user }: { user: IAPILoginInfo } = yield select(
        (state: any) => state.main
      );
      const p: Partial<ISysLog> = {
        ...payload,
        username: user.name
      };
      yield call(logSvc.log, p);
    }
  },

  subscriptions: {
    setup(api: SubscriptionAPI) {
      // const { history, dispatch } = api;
      // history.listen((location: any) => {
      //   if (location.pathname === "/logs") {
      //     // 如果 logs 已经有数据了，就不需要再从 api 获取；
      //     // 不能直接取 state，所以采用间接的方式；
      //     // dispatch({ type: "reloadLogs" });
      //   }
      // });
    }
  }
};

export default model;
