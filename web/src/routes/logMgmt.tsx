import * as React from "react";

import { Breadcrumb, Button, Col, DatePicker, Input, Row, Table } from "antd";

import { connect } from "dva";

import {
  IGlobalState,
  ISysLog,
  ISysState,
  LoadData,
  LogModel,
  UpdateState,
  ZDvaDispatch
} from "@models/types";

import {
  ButtonOnClick,
  DateRangeOnChange,
  InputOnChange,
  RangeValue,
  TypedColumn
} from "@components/types";

import { dateFormat } from "@utils/helper";

const { RangePicker } = DatePicker;

// 顶部的 查询，下载
interface ISearchBarProps {
  paramCond: string;
  paramRange: RangeValue;
  onParamCondChange: InputOnChange;
  onParamRangeChange: DateRangeOnChange;
  onSearch: ButtonOnClick;
  onExport: ButtonOnClick;
}

const SearchBar: React.SFC<ISearchBarProps> = props => {
  const {
    paramCond,
    paramRange,
    onParamCondChange,
    onParamRangeChange,
    onSearch,
    onExport
  } = props;

  return (
    <Row>
      <Col span={6}>
        <RangePicker
          value={paramRange}
          format={dateFormat}
          onChange={onParamRangeChange}
        />
      </Col>
      <Col span={6}>
        <Input
          // style={{ width: "60%" }}
          name="paramCond"
          placeholder="请输入搜索条件"
          value={paramCond}
          onChange={onParamCondChange}
        />
      </Col>
      <Col span={8}>
        <Button onClick={onSearch}>查询</Button>
        <Button onClick={onExport}>导出</Button>
      </Col>
    </Row>
  );
};

// 列表
interface ILogItemsProps {
  logs: ISysLog[];
}

const LogItems: React.SFC<ILogItemsProps> = props => {
  const columns: TypedColumn<ISysLog> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "访问时间",
      dataIndex: "serverDT",
      key: "serverDT"
    },
    {
      title: "IP",
      dataIndex: "remoteIP",
      key: "remoteIP"
    },
    {
      title: "功能",
      dataIndex: "func",
      key: "func"
    },
    {
      title: "参数",
      dataIndex: "param",
      key: "param"
    }
  ];

  // tslint:disable-next-line:max-classes-per-file
  class ItemTable extends Table<ISysLog> {}

  return (
    <div>
      <ItemTable
        size="middle"
        columns={columns}
        dataSource={props.logs}
        rowKey="id"
      />
    </div>
  );
};

// 整个页面，上面是 searchbar，下面是 table
// 把 store 中对应的 model 映射到 props，理论上，不再需要 state，全部数据都可以保存在 store 中
function mapStateToProps(state: IGlobalState) {
  const sys = state[LogModel];
  return {
    ...sys
  };
}

// 通过 dispatch，无论是 同步更新，还是异步更新，都通过 action 来实现；
// ui op --> dispatch action --> update store --> props
function mapDispatchToProps(dispatch: ZDvaDispatch) {
  // 特定方法的参数
  interface ILoadLogs {
    cond: string;
    start_dt: string;
    end_dt: string;
  }

  // 通用的 state 更新参数
  type StateT = Partial<ISysState>;

  return {
    loadLogs: (param: ILoadLogs) =>
      dispatch({
        type: `${LogModel}/${LoadData}`,
        payload: param
      }),

    // 通过这种方式，把 component 中 state 全部都保存在 model 中，效果是：路由切换时，数据是保留的
    updateState: (param: StateT) =>
      dispatch({
        type: `${LogModel}/${UpdateState}`,
        payload: param
      })
  };
}

type ILogMgmtProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// tslint:disable-next-line:max-classes-per-file
class LogMgmt extends React.Component<ILogMgmtProps> {
  constructor(props: ILogMgmtProps) {
    super(props);
  }

  // 使用到了生命周期，所以只能是 class
  public componentDidMount() {
    this.onSearch();
  }

  // 输入条件
  public onParamCondChange: InputOnChange = e => {
    const target = e.currentTarget;

    this.props.updateState({
      paramCond: target.value
    });
  };

  public onParamRangeChange: DateRangeOnChange = (range: RangeValue) => {
    this.props.updateState({
      paramRange: range
    });
  };

  public onSearch = () => {
    const param = {
      cond: this.props.paramCond,
      start_dt: this.props.paramRange[0].format(dateFormat),
      end_dt: this.props.paramRange[1].format(dateFormat)
    };

    // console.log("param: ", param);
    this.props.loadLogs(param);
  };

  public onExport: ButtonOnClick = () => {
    console.log("exporting....");
  };

  public render() {
    const { paramCond, paramRange } = this.props;
    const searchProps: ISearchBarProps = {
      paramCond,
      paramRange,
      onParamCondChange: this.onParamCondChange,
      onParamRangeChange: this.onParamRangeChange,
      onSearch: this.onSearch,
      onExport: this.onExport
    };

    return (
      <div>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>{"系统日志"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 600 }}>
          <SearchBar {...searchProps} />
          <LogItems {...this.props} />
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogMgmt);
