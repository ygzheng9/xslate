import { Route, Router, Switch } from "dva/router";
import * as React from "react";

// Markor
import MarkorApp from "./Markor";

export default function({ history }: { history: any }) {
  return (
    <Router history={history}>
      <Switch>
        <Route component={MarkorApp} />
      </Switch>
    </Router>
  );
}
