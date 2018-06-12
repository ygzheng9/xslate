import * as React from "react";

import { message, Tag } from "antd";

import produce from "immer";

import { ZButton, ZButtonCounter } from "./tsComponent";

import ZHOCMenu from "./toggleHoc";

import ZMenuV1 from "./toggleSelf";

import ZMenuCallback from "./toggleChildRender";

interface IDummyStates {
  count: number;
}

// tslint:disable-next-line:max-classes-per-file
class Dummy extends React.Component<any, IDummyStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      count: 0
    };
  }

  public onClick = () => {
    message.info("clicked.");

    // produce 第一个参数是一个 函数，这个函数的第一个参数是 draft，也即：当前 state；
    // 函数内部，直接修改传入的参数的属性(draft.prop=xxx)，但是不要重新赋值(draft=xxx)
    // 函数返回 void
    this.setState(
      produce((draft: IDummyStates) => {
        draft.count++;
      })
    );
  };

  public render() {
    const { count } = this.state;

    return (
      <div>
        <Tag color="magenta">{`clicked: ${count}`}</Tag>
        <hr />
        <ZButton onClick={this.onClick}>{"SFC"}</ZButton>
        <hr />
        <ZButtonCounter />
        <hr />
        <ZButtonCounter />
        <hr />
        <ZHOCMenu />

        <hr />
        <ZMenuV1 />

        <hr />
        <h1>{"callback"}</h1>
        <ZMenuCallback />
      </div>
    );
  }
}

export default Dummy;
