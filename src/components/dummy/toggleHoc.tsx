import * as React from "react";

////////////////////////
interface IToggle {
  show: boolean;
}
const makeToggleable = (Clickable: any) => {
  // tslint:disable-next-line:max-classes-per-file
  return class extends React.Component<any, IToggle> {
    constructor(props: any) {
      super(props);
      this.state = {
        show: false
      };
    }

    public toggle = () => {
      this.setState((prev: IToggle) => ({
        show: !prev.show
      }));
    };

    public render() {
      return (
        <div>
          <Clickable {...this.props} onClick={this.toggle} />
          {this.state.show && this.props.children}
        </div>
      );
    }
  };
};

// tslint:disable-next-line:max-classes-per-file
class ToggleableMenu extends React.Component<any, any> {
  public render() {
    return (
      <div onClick={this.props.onClick}>
        <h1>{this.props.title}</h1>
      </div>
    );
  }
}

const ToggleableMenuWrap = makeToggleable(ToggleableMenu);

const ZHOCMenu = () => {
  return (
    <div>
      <ToggleableMenuWrap title="First">
        <p>Some content</p>
      </ToggleableMenuWrap>
      <ToggleableMenuWrap title="Second">
        <p>Another content</p>
      </ToggleableMenuWrap>
      <ToggleableMenuWrap title="Third">
        <p>More content</p>
      </ToggleableMenuWrap>
    </div>
  );
};

export default ZHOCMenu;
