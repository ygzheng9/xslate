import * as React from "react";

import { Button, List, message } from "antd";

import LineItem from "./explosionRightItem";

import { IFlatNode } from "./types";

import "./explosion.css";

// 右边的下级列表

export interface ISubNodesProps {
  selectedNode: IFlatNode | undefined;
  nextLevel: IFlatNode[];
}

interface IShoppingItem {
  id: string;
  value: number;
}

interface ISubNodesStates {
  shoppingList: IShoppingItem[];
}

// tslint:disable-next-line:max-classes-per-file
class SubNodes extends React.Component<ISubNodesProps, ISubNodesStates> {
  constructor(props: ISubNodesProps) {
    super(props);
    this.state = {
      // 当前页面，加入购物车的物料，以及对应的数量；
      // 内部元素的格式： {id， value}
      shoppingList: []
    };
  }

  public componentWillReceiveProps(nextProps: ISubNodesProps) {
    // 如果选中节点发生变化了，那么清空列表；
    if (
      nextProps.selectedNode === undefined ||
      this.props.selectedNode === undefined ||
      this.props.selectedNode.key !== nextProps.selectedNode.key
    ) {
      // console.log("navigation changed!");
      this.setState({
        shoppingList: []
      });
    }
  }

  // 每一行，都可以修改数量，对应一个单独的处理函数
  public onQuantityChanged = (id: string) => (value: number) => {
    const { shoppingList } = this.state;

    // 按照 id 先删除，然后再加入
    const remainings = shoppingList.filter(i => i.id !== id);

    remainings.push({ id, value });

    this.setState({
      shoppingList: remainings
    });
  };

  public onAddToCart = () => {
    const { shoppingList } = this.state;
    console.log("need put those into cart: ", shoppingList);

    message.info("已成功加入购物车");
  };

  public render() {
    const { selectedNode, nextLevel } = this.props;
    if (selectedNode === undefined) {
      return "";
    }

    const merged = [selectedNode, ...nextLevel];
    const allItems = merged.map(i => ({ ...i, id: i.key }));

    // const msg = `${selectedNode.title} - ${selectedNode.key}`;

    return (
      <div>
        <h2>{"备件清单"}</h2>

        <div className="listContainer">
          <List
            dataSource={allItems}
            // tslint:disable-next-line:jsx-no-lambda
            renderItem={(item: typeof allItems[0]) => {
              // const changeHandle = this.onQuantityChanged(item.id);

              const props = {
                onChange: this.onQuantityChanged(item.id),
                ...item
              };

              return (
                <List.Item>
                  <LineItem {...props} />
                </List.Item>
              );
            }}
          />
        </div>
        <div className="alignRight">
          <Button type="primary" onClick={this.onAddToCart}>
            加入购物车
          </Button>
        </div>
      </div>
    );
  }
}

export default SubNodes;
