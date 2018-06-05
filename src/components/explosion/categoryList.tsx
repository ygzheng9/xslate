import * as React from "react";

import { Link } from "react-router-dom";

import { Card, Col, List, message, Row } from "antd";

import { mockCategories } from "./mockData";
import { ICategory, IProject } from "./types";

import "./categoryList.css";

type ICategoryItemProps = ICategory;

// 每个类型，以及其下的工号
const CategoryItem = ({ pType, items }: ICategoryItemProps) => {
  const notReady = (projectNo: string) => () => {
    message.info(`${projectNo} 未导入，敬请期待`);
  };

  // TODO: 发布时需要修改
  // const nanUrl =
  //   "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1527571802575&di=ddb342cb09bc0a7170a3f16387d5a419&imgtype=0&src=http%3A%2F%2Fwww.gzhijing.com%2Fupload%2Fimage%2F20140907%2F2014090716160257257.jpg";

  // const picUrl = "https://terminexus.local:9002/ibmb2bstorefront/_ui/responsive/common/images/pic/11.png"
  // const nanUrl = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png";
  const picUrl = "/pic/11.jpg";
  const nanUrl = "/pic/notReady.jpg";

  const renderItem = (item: IProject) => (
    <List.Item
      key={item.pName}
      extra={
        item.active ? (
          <Link to={`/explosion/${item.pName}`}>
            <img style={{ width: 160, height: 110 }} src={picUrl} />
          </Link>
        ) : (
          <div onClick={notReady(item.pName)}>
            <img
              className="notReady"
              style={{ width: 160, height: 110 }}
              src={nanUrl}
            />
          </div>
        )
      }
    >
      <List.Item.Meta
        title={item.active ? item.pName : `${item.pName} - 进行中`}
        description="工程简介"
      />
    </List.Item>
  );

  return (
    <Col span={4}>
      <Card title={pType} bordered={false} style={{ padding: "8px" }}>
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={renderItem}
        />
      </Card>
    </Col>
  );
};

interface ICategoryListStates {
  typeList: ICategoryItemProps[];
}

class CategoryList extends React.Component<{}, ICategoryListStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      typeList: []
    };
  }

  public componentDidMount() {
    // 从后台加载数据

    this.setState({
      typeList: mockCategories
    });
  }

  public render() {
    const { typeList } = this.state;

    const listTag = typeList.map(i => <CategoryItem key={i.pType} {...i} />);

    return (
      <div>
        <Row>{listTag}</Row>
      </div>
    );
  }
}

export default CategoryList;
