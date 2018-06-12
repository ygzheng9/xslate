import * as React from "react";

import { connect } from "dva";

import { Breadcrumb, Button, Col, Row, Tree } from "antd";

import axios from "axios";

import * as _ from "lodash";

import * as moment from "moment";

import { IAPIAssortment, IAPIProduct, IAPIProductGroup } from "./types";

import "./markor.css";

const TreeNode = Tree.TreeNode;

// tslint:disable-next-line:max-classes-per-file
class RemoteImg extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      loading: true,
      imgUrl: ""
    };
  }

  public componentDidMount() {
    const { product } = this.props;

    const url = `/api/getFileList`;
    axios.post(url, { product }).then(res => {
      if (res.statusText !== "OK") {
        console.log("loading image failed: ", product);
        return;
      }

      // 返回结果中，优先 _S_1，再第一个，再空；
      let imgUrl = "";
      const list = res.data.results as string[];
      if (list.length !== 0) {
        const idx = list
          .map(l => l.toUpperCase())
          .findIndex(l => l.indexOf("_S_1") >= 0);
        if (idx > 0) {
          imgUrl = list[idx];
        } else {
          imgUrl = list[0];
        }
      }

      // console.log("product, img: ", product, imgUrl);

      this.setState({
        loading: false,
        imgUrl
      });
    });
  }

  public render() {
    const { existClient } = this.props;
    const { loading, imgUrl } = this.state;

    if (loading) {
      return <div>{"图片加载中...."}</div>;
    }

    if (imgUrl.length === "") {
      return <div>{"图片不存在"}</div>;
    }

    const remoteUrl = existClient.signatureUrl(imgUrl);

    return <img src={remoteUrl} className="preview" />;
  }
}

interface IProductsMgmtProps {
  // ali-yun OSS
  client: any;
  existClient: any;

  // 产品组
  allGroups: IAPIProductGroup[];

  // 备选库
  allProducts: IAPIProduct[];

  // 在线库
  assortments: IAPIAssortment[];

  //
  loadAllData: () => void;
}

interface IProductsMgmtStates {
  selectedKey: string;
}

// tslint:disable-next-line:max-classes-per-file
class ProductsMgmt extends React.Component<
  IProductsMgmtProps,
  IProductsMgmtStates
> {
  public client: IProductsMgmtProps;

  constructor(props: any) {
    super(props);

    this.state = {
      selectedKey: ""
    };
  }

  // 树分三级，是固定的
  public getFixedTree = () => {
    const { allGroups, allProducts, assortments } = this.props;
    if (allGroups.length === 0) {
      return <div />;
    }

    const levelOne = allGroups.filter(n => n.name === "Department");
    const levelTwo = allGroups.filter(n => n.name === "Product Class");
    const levelThree = allGroups.filter(n => n.name === "Product Subclass");

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

                  const assorts = assortments.filter(
                    p =>
                      p.department === a.value &&
                      p.productClass === b.value &&
                      p.productSubclass === c.value
                  );

                  const title = `${c.value} ${assorts.length} / ${
                    subProducts.length
                  }`;

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
      <div>
        <Tree showLine={true} onSelect={this.onSelect}>
          {tags}
        </Tree>
      </div>
    );
  };

  // 选中树中的节点
  public onSelect = (selectedKeys: string[]) => {
    // console.log("tree selected: ", selectedKeys);

    this.setState({
      selectedKey: selectedKeys[0]
    });
  };

  public productTag = () => {
    const { allProducts, client, existClient, assortments } = this.props;

    const { selectedKey } = this.state;

    if (
      selectedKey === null ||
      selectedKey === undefined ||
      selectedKey === ""
    ) {
      return <div />;
    }

    const conds = selectedKey.split("-");
    // 前缀 + 三级
    if (conds.length < 4) {
      return <div />;
    }

    // 选中节点下的产品列表，备选商品
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
          <img key={i} className="preview" src={client.signatureUrl(i)} />
        ));
      }

      return (
        <Col span={8} key={p.objectId}>
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

    // 在线商品
    const assorts = assortments.filter(
      a =>
        a.department === conds[1] &&
        a.productClass === conds[2] &&
        a.productSubclass === conds[3]
    );

    // console.log("assorts: ", assorts.length);

    const assoTag = assorts.map(a => {
      // assortment 其下的 商品列表
      let pTag: JSX.Element[] | null = null;

      if (
        a.productes !== null &&
        a.productes !== undefined &&
        a.productes.length !== 0
      ) {
        pTag = a.productes.map(ap => {
          if (ap.product === undefined || ap.product.length === 0) {
            return <div key={ap.id} />;
          }

          const param = { existClient, product: ap.product };
          return (
            <div key={ap.id}>
              {`${ap.name} - ${ap.price}`}
              <RemoteImg {...param} />
            </div>
          );
        });
      }

      return (
        <Col span={8} key={a.id}>
          <div>
            <div className="message">
              <p>{a.name}</p>
            </div>
            {pTag}
          </div>
        </Col>
      );
    });

    const tagTitle = tag.length > 0 && (
      <div>
        <h3>{"备选"}</h3>
        {tag}
      </div>
    );

    const assoTagTitle = assoTag.length > 0 && (
      <div>
        <h3>{"在线"}</h3>
        {assoTag}
      </div>
    );

    return (
      <Col span={18}>
        <Row key={"offline"}>
          <Col key={"offline-tag"}>{tagTitle}</Col>
        </Row>
        <Row key={"online"}>
          <Col key={"online-assortment"}>{assoTagTitle}</Col>
        </Row>
      </Col>
    );
  };

  public render() {
    const { loadAllData, allGroups } = this.props;

    const btnTitle = "数据未加载，点击加载";

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>{"备选商品"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {allGroups.length === 0 && (
            <Button onClick={loadAllData}> {btnTitle} </Button>
          )}

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

function mapStateToProps(store: any) {
  const { markorApp } = store;
  const {
    allGroups,
    allProducts,
    client,
    existClient,
    assortments
  } = markorApp;

  return {
    allGroups,
    allProducts,
    client,
    existClient,
    assortments
  };
}

// 把 dispatch 映射到组件的属性，这样组件中就可以不出现 dispatch 了
// 注意，这里定义的都是 func，而不是一个 dispatch 调用；
function mapDispatchToProps(dispatch: any) {
  return {
    // 根据 ref 查找变更记录
    loadAllData: () => {
      dispatch({
        type: "markorApp/loadProducts"
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductsMgmt);
