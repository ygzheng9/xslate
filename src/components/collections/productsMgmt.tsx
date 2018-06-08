import axios from "axios";
import * as React from "react";

import { Breadcrumb, Button, Col, Row, Tree } from "antd";

import * as _ from "lodash";

import OSS from "ali-oss";

import * as moment from "moment";

import { IAPIProduct, IAPIProductGroup } from "./types";

import "./markor.css";

const TreeNode = Tree.TreeNode;

interface IProductMgmtStates {
  selectedKey: string;
  allNodes: IAPIProductGroup[];

  // 备选库
  allProducts: IAPIProduct[];

  // 在线库
  onlineProducts: IAPIProduct[];
}

class ProductsMgmt extends React.Component<any, IProductMgmtStates> {
  public client: any;

  constructor(props: any) {
    super(props);

    axios.defaults.headers.common.Authorization =
      "0D6CE7B65CEE2C16CBF65F4E2E289F0118F41FA1";

    // 建立 ali-oss 的客户端
    this.client = new OSS({
      accessKeyId: "LTAIJuSjXPx3B35m",
      accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
      region: "oss-cn-shanghai",
      bucket: "ordercommit"
    });

    this.state = {
      selectedKey: "",
      allNodes: [],
      allProducts: [],
      onlineProducts: []
    };
  }

  public loadTree = () => {
    const url = "/Markor/adapters/Setting/setting?limit=1000";

    axios.get(url).then(res => {
      // console.log(res);
      const allNodes = res.data.content as IAPIProductGroup[];

      // console.log(allNodes.filter(n => n.grouping === n.value));

      console.log(_.uniq(allNodes.map(n => n.name)));

      this.setState({
        allNodes
      });
    });
  };

  public loadProducts = () => {
    const url = `/Markor/adapters/Product/products?offset=1&limit=100&timeStamp=0`;

    axios.get(url).then(res => {
      console.log(res);
      const allProducts = res.data.content[0].results as IAPIProduct[];

      // console.log(allProducts);

      // 饰品-桌面摆饰-装饰摆件
      // const remains = allProducts.filter(
      //   p =>
      //     p.department === "饰品" &&
      //     p.productClass === "桌面摆饰" &&
      //     p.productSubclass === "装饰摆件"
      // );

      const remains = allProducts.filter(p => p.images !== null);

      console.log(remains);

      // console.log(_.uniq(allNodes.map(n => n.name)));

      this.setState({
        allProducts
      });
    });
  };

  public loadMasterProducts = () => {
    const url = `/Markor/adapters/Product/masterproducts?offset=1&limit=100&timeStamp=1496985269656`;

    axios.get(url).then(res => {
      console.log(res);
      // const allProducts = res.data.content[0].results as IAPIProduct[];

      // console.log(allProducts);

      // 饰品-桌面摆饰-装饰摆件
      // const remains = allProducts.filter(
      //   p =>
      //     p.department === "饰品" &&
      //     p.productClass === "桌面摆饰" &&
      //     p.productSubclass === "装饰摆件"
      // );

      // const remains = allProducts.filter(p => p.images !== null);

      // console.log(remains);

      // // console.log(_.uniq(allNodes.map(n => n.name)));

      // this.setState({
      //   allProducts
      // });
    });
  };

  // 树分三级，是固定的
  public getFixedTree = () => {
    const { allNodes, allProducts } = this.state;
    if (allNodes.length === 0) {
      return <div />;
    }

    const levelOne = allNodes.filter(n => n.name === "Department");
    const levelTwo = allNodes.filter(n => n.name === "Product Class");
    const levelThree = allNodes.filter(n => n.name === "Product Subclass");

    const tags = levelOne.map(a => {
      const lvl2 = levelTwo.filter(t => t.grouping === a.value);

      return (
        <TreeNode title={a.value} key={`L1-${a.value}`}>
          {lvl2.map(b => {
            const lvl3 = levelThree.filter(t => t.grouping === b.value);

            return (
              <TreeNode title={b.value} key={`L2-${a.value}-${b.value}`}>
                {lvl3.map(c => {
                  // 第三级下面的产品个数
                  const subProducts = allProducts.filter(
                    p =>
                      p.department === a.value &&
                      p.productClass === b.value &&
                      p.productSubclass === c.value
                  );

                  const title =
                    subProducts.length === 0
                      ? c.value
                      : `${c.value} - ${subProducts.length}`;

                  return (
                    <TreeNode
                      title={title}
                      key={`L3-${a.value}-${b.value}-${c.value}`}
                    />
                  );
                })}
              </TreeNode>
            );
          })}
        </TreeNode>
      );
    });

    return (
      <div className="treeContainer">
        <Tree showLine={true} onSelect={this.onSelect}>
          {tags}
        </Tree>
      </div>
    );
  };

  // 选中树中的节点
  public onSelect = (selectedKeys: string[]) => {
    console.log("tree selected: ", selectedKeys);

    this.setState({
      selectedKey: selectedKeys[0]
    });
  };

  public productTag = () => {
    const { selectedKey, allProducts } = this.state;

    if (selectedKey !== null && selectedKey !== "") {
      const conds = selectedKey.split("-");
      // 前缀 + 三级
      if (conds.length < 4) {
        return <div />;
      }

      // 选中节点下的产品列表
      const products = allProducts.filter(
        p =>
          p.department === conds[1] &&
          p.productClass === conds[2] &&
          p.productSubclass === conds[3]
      );

      const tag = products.map(p => {
        let imgsTag: JSX.Element | JSX.Element[] = <div />;

        if (p.images !== null && p.images !== undefined) {
          // 获取不重复的图片
          const allImgs = p.images.map(i => i.osspath);
          const distImgs = _.uniq(allImgs);

          imgsTag = distImgs.map(i => (
            <img
              key={i}
              className="preview"
              src={this.client.signatureUrl(i)}
            />
          ));
        }

        return (
          <Col span={6} key={p.objectId}>
            <div>
              <div className="message">
                <p>{`${p.name}`}</p>
                <p>{`${moment(p.createdAt).toNow()} ${p.detail}`}</p>
              </div>
              {imgsTag}
            </div>
          </Col>
        );
      });

      return tag;
    }

    return <div />;
  };

  public render() {
    // const { allNodes } = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          <Button onClick={this.loadTree}> {"加载树"} </Button>
          <Button onClick={this.loadProducts}> {"加载备选"} </Button>
          <Button onClick={this.loadMasterProducts}> {"加载在线"} </Button>

          <div>
            <Row>
              <Col span={6}>{this.getFixedTree()}</Col>
              <Col>{this.productTag()}</Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductsMgmt;
