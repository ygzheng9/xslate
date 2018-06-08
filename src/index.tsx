import * as React from "react";
import * as ReactDOM from "react-dom";

import ProductsMgmt from "@components/collections/productsMgmt";

import "antd/dist/antd.css";
import "./index.css";

import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<ProductsMgmt />, document.getElementById(
  "root"
) as HTMLElement);

registerServiceWorker();
