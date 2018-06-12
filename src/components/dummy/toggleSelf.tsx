import * as React from "react";

import { Button, Col, message, Row, Tag } from "antd";

////////////////////////
interface IToggleStates {
  show: boolean;
}

class ToggleButton extends React.Component<any, IToggleStates> {
  constructor(props: any) {
    super(props);
    this.state = {
      show: false
    };
  }

  public toggle = () => {
    this.setState((prev: IToggleStates) => ({
      show: !prev.show
    }));
  };

  public render() {
    return (
      <div>
        <Button {...this.props} onClick={this.toggle}>
          {`Button: ${this.props.title}`}
        </Button>
        {this.state.show && this.props.children}
      </div>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
class ToggleTag extends React.Component<any, IToggleStates> {
  constructor(props: any) {
    super(props);
    this.state = {
      show: false
    };
  }

  public toggle = () => {
    this.setState((prev: IToggleStates) => ({
      show: !prev.show
    }));
  };

  public render() {
    return (
      <div>
        <Tag {...this.props} onClick={this.toggle}>
          {`Tag: ${this.props.title}`}
        </Tag>
        {this.state.show && this.props.children}
      </div>
    );
  }
}

// Button, Tag 代码相同，考虑变成一个HOC，把 Button/Tag 作为参数传入
const ToggleHoc = (Comp: any) => {
  return (
    // tslint:disable-next-line:max-classes-per-file
    class extends React.Component<any, IToggleStates> {
      constructor(props: any) {
        super(props);
        this.state = {
          show: false
        };
      }

      public toggle = () => {
        this.setState((prev: IToggleStates) => ({
          show: !prev.show
        }));
      };

      public render() {
        return (
          <div>
            <Comp {...this.props} onClick={this.toggle}>
              {`HOC: ${this.props.title}`}
            </Comp>
            {this.state.show && this.props.children}
          </div>
        );
      }
    }
  );
};

// 具体的 Component，HoC相当于注入了某些属性/方法
const ToggleButton2 = ToggleHoc(Button);
const ToggleTag2 = ToggleHoc(Tag);

// ToggleHoc 中，在 Comp 自身的渲染无效，以这里为准；
const ZButtonTxt = (props: any) => {
  const btnClick = (title: string) => () => {
    message.info(`button clicked: ${title}`);
  };

  return (
    <div>
      <h3 onClick={props.onClick}>{"自定义组件"}</h3>
      <Button onClick={btnClick(props.title)}> {props.title}</Button>
    </div>
  );
};

const ToggleZButtonTxt = ToggleHoc(ZButtonTxt);

const ZMenuV1 = () => {
  return (
    <div>
      <Row>
        <Col span={12}>
          <h3>{"这是 Button"}</h3>
          <ToggleButton title="First">
            <p>Some content</p>
          </ToggleButton>
          <ToggleButton title="Second">
            <p>Another content</p>
          </ToggleButton>
          <ToggleButton title="Third">
            <p>More content</p>
          </ToggleButton>
        </Col>
        <Col span={12}>
          <h3>{"这是 Tag"}</h3>
          <ToggleTag title="First" color="#2db7f5">
            <p>Some content</p>
          </ToggleTag>
          <ToggleTag title="Second" color="#87d068">
            <p>Another content</p>
          </ToggleTag>
          <ToggleTag title="Third" color="#108ee9">
            <p>More content</p>
          </ToggleTag>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <h3>{"这是 Button2"}</h3>
          <ToggleButton2 title="First">
            <p>Some content</p>
          </ToggleButton2>
          <ToggleButton2 title="Second">
            <p>Another content</p>
          </ToggleButton2>
          <ToggleButton2 title="Third">
            <p>More content</p>
          </ToggleButton2>
        </Col>
        <Col span={12}>
          <h3>{"这是 Tag2"}</h3>
          <ToggleTag2 title="First" color="#2db7f5">
            <p>Some content</p>
          </ToggleTag2>
          <ToggleTag2 title="Second" color="#87d068">
            <p>Another content</p>
          </ToggleTag2>
          <ToggleTag2 title="Third" color="#108ee9">
            <p>More content</p>
          </ToggleTag2>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <h3>{"这是 自定义Button"}</h3>
          <ToggleZButtonTxt title="First">
            <p>Some content</p>
          </ToggleZButtonTxt>
          <ToggleZButtonTxt title="Second">
            <p>Another content</p>
          </ToggleZButtonTxt>
          <ToggleZButtonTxt title="Third">
            <p>More content</p>
          </ToggleZButtonTxt>
        </Col>
      </Row>
    </div>
  );
};

export default ZMenuV1;
