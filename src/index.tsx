import * as React from "react";
import * as ReactDOM from "react-dom";

// Terminexus
import App from "./App";

// Markor
// import MarkorApp from "./routes/Markor";

import "antd/dist/antd.css";
import "./index.css";

import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
registerServiceWorker();
