import {
  EffectsCommandMap,
  IDvaAction,
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
    *loadAllLogs(action: IDvaAction, effects: EffectsCommandMap) {
      console.log("sysModel loadAllLogs....");

      const { put, call } = effects;

      const result = yield call(logSvc.query);
      console.log("result: ", result);

      yield put({
        type: "updateState",
        payload: {
          logs: result.data.items
        }
      });
    }
  },

  subscriptions: {
    setup(api: SubscriptionAPI) {
      const { history, dispatch } = api;
      // console.log('common model subscriptions:', dispatch, history)
      // 数据库界面
      history.listen((location: any) => {
        if (location.pathname === "/logs") {
          // 加载
          dispatch({ type: "loadAllLogs" });
          // console.log("to threads...");
        }
      });
    }
  }
};

export default model;
