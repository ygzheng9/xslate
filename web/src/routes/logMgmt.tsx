import * as React from "react";

import * as moment from "moment";

import { Breadcrumb, Button, Col, DatePicker, Input, Row, Table } from "antd";

import { connect } from "dva";

import { IDvaDispatch, IGlobalState, ISysLog, LogModel } from "@models/types";

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
function mapStateToProps(state: IGlobalState) {
  const sys = state[LogModel];
  return {
    logs: sys.logs
  };
}

function mapDispatchToProps(dispatch: IDvaDispatch) {
  return {
    loadLogs: (param: any) =>
      dispatch({
        type: `${LogModel}/loadLogs`,
        payload: param
      })
  };
}

type ILogMgmtProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface ILogMgmtStates {
  paramCond: string;
  paramRange: RangeValue;
}

// tslint:disable-next-line:max-classes-per-file
class LogMgmt extends React.Component<ILogMgmtProps, ILogMgmtStates> {
  constructor(props: ILogMgmtProps) {
    super(props);

    const end = moment().add(1, "days");
    const start = moment().add(-2, "months");

    this.state = {
      paramCond: "",
      paramRange: [start, end]
    };
  }

  public componentDidMount() {
    this.onSearch();
  }

  // 输入条件
  public onParamCondChange: InputOnChange = e => {
    const target = e.currentTarget;

    this.setState({
      paramCond: target.value
    });
  };

  public onParamRangeChange: DateRangeOnChange = (range: RangeValue) => {
    this.setState({
      paramRange: range
    });
  };

  public onSearch = () => {
    const param = {
      cond: this.state.paramCond,
      start_dt: this.state.paramRange[0].format(dateFormat),
      end_dt: this.state.paramRange[1].format(dateFormat)
    };

    console.log("param: ", param);
    this.props.loadLogs(param);
  };

  public onExport: ButtonOnClick = () => {
    console.log("exporting....");
  };

  public render() {
    const { paramCond, paramRange } = this.state;
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
