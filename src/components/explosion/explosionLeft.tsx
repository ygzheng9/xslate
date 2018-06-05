import * as React from "react";

import { Input, Tree } from "antd";

import { IFlatNode } from "./types";

import "./explosion.css";

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

const MAX_LOOP = 3000;
let LOOP_CNT = 0;

// 左边的树形

export interface IBomTreeProps {
  flatNodes: IFlatNode[];
  onSelect: (a: string[]) => void;
}

interface IBomTreeStates {
  expandedKeys: string[];
  searchValue: string;
  autoExpandParent: boolean;
}

// tslint:disable-next-line:max-classes-per-file
class BomTree extends React.Component<IBomTreeProps, IBomTreeStates> {
  constructor(props: IBomTreeProps) {
    super(props);

    this.state = {
      expandedKeys: [],
      searchValue: "",
      autoExpandParent: true
    };
  }

  public onExpand = (expandedKeys: string[]) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  public onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const expandedKeys = [] as string[];

    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true
    });
  };

  public render() {
    const { expandedKeys, autoExpandParent } = this.state;

    // 选中树的节点时触发
    const { flatNodes, onSelect } = this.props;

    // 如果节点为空，那么不生成树；否则再构建树
    let treeTag: JSX.Element = <div />;
    if (flatNodes.length > 0) {
      // Tree 节点本身属性固定
      // TreeNode 是递归结构
      // 从 平面结构中，找到根节点；
      // 对 根节点，找到直接下层；
      // 如果 直接下层，还有下层，则递归下去；直到没有下层节点为止
      const genTreeNode = (allNodes: IFlatNode[]) => {
        if (allNodes.length === 0) {
          return "";
        }

        const root = allNodes.find(i => i.parent === "");
        if (root === undefined) {
          return;
        }

        const wholeTree = explodeNode(root);
        return wholeTree;
      };

      // 取得 parentKey 的直接下一层节点
      // flatNodes 为 this.props;
      const getNextLevel = (parentKey: string) =>
        flatNodes.filter(i => i.parent === parentKey);

      // 从 currNode 开始，递归展开
      const explodeNode = (currNode: IFlatNode) => {
        LOOP_CNT += 1;
        if (LOOP_CNT > MAX_LOOP) {
          console.log("出错误了");
          return;
        }

        const nextLevel = getNextLevel(currNode.key);

        // 没有下一层节点
        if (nextLevel.length === 0) {
          return <TreeNode title={currNode.title} key={currNode.key} />;
        } else {
          // 还有下一层节点
          const expend: any = nextLevel.map(n => explodeNode(n));
          return (
            <TreeNode title={currNode.title} key={currNode.key}>
              {expend}
            </TreeNode>
          );
        }
      };

      // 上面定义了三个函数，这里执行，取得结果
      const nodeTag = genTreeNode(flatNodes);

      treeTag = (
        <div className="treeContainer">
          <Tree
            showLine={true}
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={onSelect}
          >
            {nodeTag}
          </Tree>
        </div>
      );
    }

    return (
      <div>
        <Search
          placeholder="Search"
          style={{ width: 200, height: 32 }}
          onChange={this.onChange}
        />
        {treeTag}
      </div>
    );
  }
}

export default BomTree;
