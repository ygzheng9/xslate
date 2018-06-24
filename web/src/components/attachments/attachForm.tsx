import * as React from "react";

import { Button, Col, Icon, Input, message, Row, Upload } from "antd";

import { BeforeUploadAction, InputOnChange } from "@utils/shortcuts";

// 上载附件的小组件
// 附件列表，是一个单独的页面，所以有一个 Back，回到来的地方
// 一个文本框，记录附件的备注信息，和附件一起 post

interface IAttachForm {
  // 文本输入框
  comment: string;
  onCommentChange: InputOnChange;

  // 上载 post 对应的服务器地址
  uploadAction: string;
  // 加工处理后的上载数据
  postData: any;
  beforeUpload: BeforeUploadAction;
  postUpload: () => void;

  // 返回按钮
  goBack: () => void;

  isPinned?: boolean;
}
const AttachForm: React.SFC<IAttachForm> = props => {
  const {
    comment,
    onCommentChange,
    postData,
    uploadAction,
    beforeUpload,
    postUpload,
    goBack,
    isPinned
  } = props;

  const uploadProps = {
    name: "file",
    data: postData,
    beforeUpload,
    action: uploadAction,
    multiple: false,
    showUploadList: false,
    headers: {
      authorization: "authorization-text"
    },
    onChange(info: any) {
      if (info.file.status !== "uploading") {
        // console.log(info.file, info.fileList)
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上载完毕`);
        postUpload();
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上载失败.`);
      }
    }
  };

  const backTag = isPinned ? "" : <Button onClick={goBack}>返回</Button>;

  return (
    <Row>
      <Col span={12}>
        <Input
          placeholder="附件的描述信息，便于日后检索"
          value={comment}
          onChange={onCommentChange}
        />
      </Col>
      <Col span={12}>
        <Upload {...uploadProps}>
          <Button>
            <Icon type="upload" /> 上载
          </Button>
        </Upload>
        {backTag}
      </Col>
    </Row>
  );
};

export default AttachForm;
