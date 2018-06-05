import * as React from "react";

import { Link, RouteComponentProps } from "react-router-dom";

import { Breadcrumb, Col, Row } from "antd";

import { IFlatNode } from "./types";

import { allData } from "./mockData";

import BomTree, { IBomTreeProps } from "./explosionLeft";
import NodePic, { INodePicProps } from "./explosionMid";
import SubNodes, { ISubNodesProps } from "./explosionRight";

import "./explosion.css";

// 整个页面

// route 的参数，通过 match.param.projectNo 引用
interface IMatchParams {
  projectNo: string;
}

// route 的接口定义
interface IExplosionProps extends RouteComponentProps<IMatchParams> {}

interface IExplosionStates {
  // 爆炸图的平面结构,
  // 每个元素的类型： {title, key, parent, picUrl, ...}
  flatNodes: IFlatNode[];

  // 当前选中的节点的 key
  selectedKey: string;
}

// tslint:disable-next-line:max-classes-per-file
class Explosion extends React.Component<IExplosionProps, IExplosionStates> {
  constructor(props: IExplosionProps) {
    super(props);
    this.state = {
      // 爆炸图的平面结构,
      // 每个元素的类型： {title, key, parent, picUrl, ...}
      flatNodes: [],

      // 当前选中的节点的 key
      selectedKey: "P001"
    };
  }

  public componentDidMount() {
    // 加载平面结构
    this.setState({
      flatNodes: allData
    });
  }

  // 选中树中的节点
  public onSelect = (selectedKeys: string[]) => {
    this.setState({
      selectedKey: selectedKeys[0]
    });
  };

  public render() {
    const { flatNodes, selectedKey } = this.state;

    const { match } = this.props;

    // 根据 key，取得选中的 node
    // 注意，一定是 ===，千万别写成 = ；一旦写成 =，flatNodes 中的数据，会被更新;
    const selectedNode = flatNodes.find(i => i.key === selectedKey);

    // 左边树形的属性
    const treeProps: IBomTreeProps = {
      flatNodes,
      onSelect: this.onSelect
    };

    // 中间图片区域的属性
    const picProps: INodePicProps = {
      selectedNode
    };

    // 取得当前选中节点的直接下层
    const nextLevel = flatNodes.filter(i => i.parent === selectedKey);

    // 右边直接下级的属性
    const belowProps: ISubNodesProps = {
      selectedNode,
      nextLevel
    };

    return (
      <div>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">项目列表</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{match.params.projectNo}</Breadcrumb.Item>
        </Breadcrumb>

        <br />

        <Row>
          <Col span={1} />
          <Col span={5}>
            <BomTree {...treeProps} />
          </Col>
          <Col span={6}>
            <NodePic {...picProps} />
          </Col>
          <Col span={12}>
            <SubNodes {...belowProps} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Explosion;
