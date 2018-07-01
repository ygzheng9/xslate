import * as React from "react";

import { connect } from "dva";

import {
  Breadcrumb,
  Button,
  Carousel,
  Col,
  message,
  Modal,
  Row,
  Tree
} from "antd";

import axios from "axios";
import * as _ from "lodash";
import * as moment from "moment";

import {
  IAPIAssortment,
  IAPIOPHistory,
  IAPIProduct,
  IAPIProductGroup
} from "@components/collections/types";

import { IGlobalState, LoadProducts, MainModel } from "@models/types";
import { TypedColumn, TypedTable, ZActionType } from "@utils/shortcuts";

import "./collections.css";

const TreeNode = Tree.TreeNode;

// tslint:disable-next-line:max-classes-per-file
// 每张图片
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

    return <img src={remoteUrl} className="modalPic" />;
  }
}

interface IShowLogProps {
  items: IAPIOPHistory[];
}

const ShowLog = (props: IShowLogProps) => {
  const { items } = props;

  const list = items
    .sort((a, b) => (a.updateTimeStamp > b.updateTimeStamp ? 1 : -1))
    .map((i, idx) => ({ ...i, idx }));

  const columns: TypedColumn<IAPIOPHistory> = [
    {
      title: "#",
      dataIndex: "idx",
      key: "idx"
    },
    {
      title: "时间",
      dataIndex: "updateTimeStamp",
      key: "updateTimeStamp",
      render: (text, record) => {
        // 处理 unix 时间戳
        const m = moment(text, "x").format("YYYY-MM-DD HH:mm");
        return m;
      }
    },
    {
      title: "用户",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "操作",
      dataIndex: "operateType",
      key: "operateType"
    }
  ];

  const ItemTable = TypedTable<IAPIOPHistory>();

  return (
    <div>
      <ItemTable columns={columns} dataSource={list} rowKey="updateTimeStamp" />
    </div>
  );
};

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

  // 修改日志
  opHistory: IAPIOPHistory[];

  //
  loadAllData: () => void;
}

const ProductsMgmtStates = {
  selectedKey: "",

  // 是否显示备选商品的 modal
  productModal: false,
  currProduct: {} as IAPIProduct,

  // 是否显示 assortment 的 modal
  assortModal: false,
  currAssort: {} as IAPIAssortment
};

type IProductsMgmtStates = typeof ProductsMgmtStates;

// tslint:disable-next-line:max-classes-per-file
class ProductsMgmt extends React.Component<
  IProductsMgmtProps,
  IProductsMgmtStates
> {
  public client: IProductsMgmtProps;

  constructor(props: any) {
    super(props);

    this.state = ProductsMgmtStates;
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

  // 取得 product 的图片数量
  public getProductImgCount = (prod: IAPIProduct) => {
    let imgCount = 0;
    if (prod.images !== null && prod.images !== undefined) {
      // 获取不重复的图片
      const allImgs = prod.images.map(i => i.osspath);
      const distImgs = _.uniq(allImgs);
      imgCount = _.size(distImgs);
    }
    return imgCount;
  };

  // 选中一个 prodcut
  public selectProduct = (prod: IAPIProduct) => () => {
    const imgCount = this.getProductImgCount(prod);

    // 没有图片；
    if (imgCount === 0) {
      message.warning("尚未提供照片");
      return;
    }

    // 有图片时，才显示图片；
    this.setState({
      productModal: true,
      currProduct: prod
    });
  };

  // 取得 assortment 下的 product 个数
  public getAssortProductCount = (a: IAPIAssortment) => {
    let cnt = 0;
    if (
      a.productes !== null &&
      a.productes !== undefined &&
      a.productes.length !== 0
    ) {
      cnt = a.productes.length;
    }
    return cnt;
  };

  // 选中一个 assortment
  public selectAssortment = (asso: IAPIAssortment) => () => {
    const prodCount = this.getAssortProductCount(asso);

    // 没有产品；
    if (prodCount === 0) {
      message.warning("无商品信息");
      return;
    }

    // 有图片时，才显示图片；
    this.setState({
      assortModal: true,
      currAssort: asso
    });
  };

  public productTag = () => {
    const { allProducts, assortments } = this.props;
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
      // 显示图片数量
      const imgCount = this.getProductImgCount(p);

      return (
        <Col span={8} key={p.objectId}>
          <div>
            <div className="message" onClick={this.selectProduct(p)}>
              <p>{`${p.name} / ${imgCount}`}</p>
              <p>{`${moment(p.createdAt).toNow()} ${p.detail}`}</p>
            </div>
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

    const assoTag = assorts.map(a => {
      const cnt = this.getAssortProductCount(a);

      return (
        <Col span={8} key={a.id}>
          <div>
            <div className="message" onClick={this.selectAssortment(a)}>
              <p>{`${a.name} / ${cnt}`}</p>
            </div>
          </div>
        </Col>
      );
    });

    const tagTitle = tag.length > 0 && (
      <div>
        <h3>{"备选"}</h3>
        <hr />
        {tag}
      </div>
    );

    const assoTagTitle = assoTag.length > 0 && (
      <div>
        <h3>{"在线"}</h3>
        <hr />
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

  // 关闭 product 的 modal 窗口
  public closeProductModal = () => {
    this.setState({
      productModal: false
    });
  };

  public closeAssoModal = () => {
    this.setState({
      assortModal: false
    });
  };

  // 根据当前选中的 product，取出其下的 imgs
  public getCurrProductImgs = () => {
    const p = this.state.currProduct;
    const { client } = this.props;

    if (p.images !== null && p.images !== undefined) {
      // 获取不重复的图片
      const allImgs = p.images.map(i => i.osspath);
      const distImgs = _.uniq(allImgs);

      const tag = distImgs.map(i => (
        <div key={i}>
          <img key={i} className="modalPic" src={client.signatureUrl(i)} />
        </div>
      ));

      return tag;
    }

    return "";
  };

  public getCurrAssoImgs = () => {
    const a = this.state.currAssort;
    const { existClient } = this.props;

    if (
      a.productes !== null &&
      a.productes !== undefined &&
      a.productes.length !== 0
    ) {
      const pTag = a.productes.map(ap => {
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

      return pTag;
    }

    return "";
  };

  public render() {
    const { loadAllData, allGroups, opHistory } = this.props;

    const btnTitle = "数据未加载，点击加载";

    const logProps = {
      items: opHistory
    };

    const modal1 = (
      <Modal
        title="备选商品"
        visible={this.state.productModal}
        onCancel={this.closeProductModal}
        footer={null}
      >
        <Carousel>{this.getCurrProductImgs()}</Carousel>
      </Modal>
    );

    const modal2 = (
      <Modal
        title="在线商品"
        visible={this.state.assortModal}
        onCancel={this.closeAssoModal}
        footer={null}
      >
        <Carousel>{this.getCurrAssoImgs()}</Carousel>
      </Modal>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>{"备选商品"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          {allGroups.length === 0 && (
            <Button onClick={loadAllData}> {btnTitle} </Button>
          )}

          <div>{false && <ShowLog {...logProps} />}</div>

          <div>
            <Row>
              <Col span={6}>{this.getFixedTree()}</Col>
              <Col>{this.productTag()}</Col>
              {this.state.productModal && modal1}
              {this.state.assortModal && modal2}
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store: IGlobalState) {
  const main = store[MainModel];

  const {
    allGroups,
    allProducts,
    client,
    existClient,
    assortments,
    opHistory
  } = main;

  return {
    allGroups,
    allProducts,
    client,
    existClient,
    assortments,
    opHistory
  };
}

// 把 dispatch 映射到组件的属性，这样组件中就可以不出现 dispatch 了
// 注意，这里定义的都是 func，而不是一个 dispatch 调用；
function mapDispatchToProps(dispatch: any) {
  return {
    // 根据 ref 查找变更记录
    loadAllData: () => {
      dispatch({
        type: ZActionType(MainModel, LoadProducts)
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductsMgmt);
