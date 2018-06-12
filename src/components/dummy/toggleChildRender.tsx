import * as React from "react";

interface IToggleStates {
  show: boolean;
}

type Props = Partial<{
  children: RenderCallback;
  render: RenderCallback;
}>;

type RenderCallback = (args: IComponentProps) => JSX.Element;

interface IToggle {
  show: boolean;
}

interface IComponentProps {
  show: IToggle["show"];
  toggle(): void;
}

class Toggleable extends React.Component<Props, IToggleStates> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false
    };
  }

  public toggle = () => {
    this.setState((prevState: IToggleStates) => ({ show: !prevState.show }));
  };

  public render() {
    const { children } = this.props;
    const params: IComponentProps = {
      show: this.state.show,
      toggle: this.toggle
    };

    if (children !== undefined) {
      return children(params);
    }

    return "";
  }
}

const ToggleableMenu = (props: any) => (
  <Toggleable>
    {({ show, toggle }) => (
      <div>
        <div onClick={toggle}>
          <h1>{props.title}</h1>
        </div>
        {show && props.children}
      </div>
    )}
  </Toggleable>
);

const ZMenuCallback = () => {
  return (
    <div>
      <ToggleableMenu title="First">
        <p>Some content</p>
      </ToggleableMenu>
      <ToggleableMenu title="Second">
        <p>Another content</p>
      </ToggleableMenu>
      <ToggleableMenu title="Third">
        <p>More content</p>
      </ToggleableMenu>
    </div>
  );
};

export default ZMenuCallback;
