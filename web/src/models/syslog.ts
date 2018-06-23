import {
  EffectsCommandMap,
  IDvaAction,
  IGlobalState,
  ISysLog,
  ISysState,
  LogModel,
  Model,
  SubscriptionAPI
} from "@models/types";

import logSvc from "@services/syslog";

const sysState: ISysState = {
  logs: [] as ISysLog[]
};

const model: Model = {
  namespace: LogModel,
  state: sysState,

  reducers: {
    updateState(state: ISysState, action: IDvaAction) {
      return { ...state, ...action.payload };
    }
  },

  effects: {
    *loadLogs(action: IDvaAction, effects: EffectsCommandMap) {
      const { put, call } = effects;
      const { payload } = action;
      console.log("payload: ", payload);

      const result = yield call(logSvc.queryByParam, payload);
      // console.log("result: ", result);

      yield put({
        type: "updateState",
        payload: {
          logs: result.data.items
        }
      });
    },

    *reloadLogs(action: IDvaAction, effects: EffectsCommandMap) {
      const { put, select } = effects;
      // 取得当前 logs，如果为空，再加载，否则，什么都不做
      const logs = yield select((state: IGlobalState) => state[LogModel].logs);
      if (logs.length === 0) {
        console.log("reload logs....");

        yield put({
          type: "loadLogs"
        });
      }
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
