import * as React from "react";

import { IFlatNode } from "./types";

import "./explosion.css";

// 中间的图片
export interface INodePicProps {
  selectedNode: IFlatNode | undefined;
}

// tslint:disable-next-line:max-classes-per-file
const NodePic = ({ selectedNode }: INodePicProps) => {
  if (selectedNode === undefined) {
    return <div />;
  }

  // 模拟
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
  }
  const i = getRandomInt(5);

  // TODO: 发布时，需要修改
  // const picUrl = `https://terminexus.local:9002/ibmb2bstorefront/_ui/responsive/common/images/pic/${i}.png`;
  // const nanUrl =
  // "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1527571802575&di=ddb342cb09bc0a7170a3f16387d5a419&imgtype=0&src=http%3A%2F%2Fwww.gzhijing.com%2Fupload%2Fimage%2F20140907%2F2014090716160257257.jpg";

  // 绝对的 url;
  // 如果没有最开始 /，那么就是相对的 url，相对于当前 route 的url
  const picUrl = `/pic/${i}.png`;
  const nanUrl = "/pic/nan.jpg";

  const onErrorPic = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = nanUrl;
  };

  return (
    <div>
      <img style={{ width: 300 }} src={picUrl} onError={onErrorPic} />
    </div>
  );
};

export default NodePic;
