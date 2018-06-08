import { routerRedux } from "dva/router";

const delay = (timeout: any) =>
  new Promise(resolve => setTimeout(resolve, timeout));

export default {
  namespace: "count",
  state: 0,
  reducers: {
    add(state: any) {
      return state + 1;
    },
    minus(state: any) {
      return state - 1;
    }
  },
  effects: {
    *addWithDelay({ call, put }: { call: any; put: any }) {
      yield call(delay, 500);
      yield put({ type: "add" });
    },
    *redirect({ put }: { put: any }) {
      yield put(routerRedux.push("/abc"));
    }
  }
};
