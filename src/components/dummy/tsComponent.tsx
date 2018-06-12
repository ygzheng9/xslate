import * as React from "react";
import { MouseEvent, SFC } from "react";

import { Button } from "antd";

interface IProps {
  onClick(e: MouseEvent<HTMLElement>): void;
}

const ZButton: SFC<IProps> = ({ onClick: handleClick, children }) => (
  <Button onClick={handleClick}>{children}</Button>
);

const initialState = { clicksCount: 0 };
type State = Readonly<typeof initialState>;

class ZButtonCounter extends React.Component<object, State> {
  public readonly state: State = initialState;

  public render() {
    const { clicksCount } = this.state;

    return (
      <div>
        <Button onClick={this.handleInc}>+</Button>
        <Button onClick={this.handleDec}>-</Button>
        You've clicked me {clicksCount}
      </div>
    );
  }

  // this.setState 的参数，是一个函数，而且是 pure funciton，而且这个 pure function 已经被放到了 class 外部；
  private handleInc = () => this.setState(incClick);
  private handleDec = () => this.setState(decClick);
}

// pure function, 返回值是 newState
const incClick = (prevState: State) => ({
  clicksCount: prevState.clicksCount + 1
});
const decClick = (prevState: State) => ({
  clicksCount: prevState.clicksCount - 1
});

export { ZButton, ZButtonCounter };
