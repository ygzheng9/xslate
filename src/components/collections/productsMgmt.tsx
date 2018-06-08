import * as React from "react";

import { Breadcrumb } from "antd";

const ProductsMgmt = () => (
  <div>
    <Breadcrumb style={{ margin: "16px 0" }}>
      <Breadcrumb.Item>Home</Breadcrumb.Item>
      <Breadcrumb.Item>List</Breadcrumb.Item>
      <Breadcrumb.Item>App</Breadcrumb.Item>
    </Breadcrumb>
    <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
      {"商品管理"}
    </div>
  </div>
);

export default ProductsMgmt;
