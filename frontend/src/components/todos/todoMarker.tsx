import * as React from "react";

import { DatePicker, Form, Input, Modal, Select } from "antd";
import { FormComponentProps } from "antd/lib/form";

import * as moment from "moment";

import { ITodoItem } from "@components/types";
import * as _ from "lodash";

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

// Form 的 label 和 content 的占比
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
  }
};

export interface ITodoMarkProps extends FormComponentProps {
  item: ITodoItem;
  visible: boolean;
  title: string;
  onOk: (a: any) => void;
  onCancel: () => void;
}

class TodoMark extends React.Component<ITodoMarkProps> {
  // 点击确定
  public handleOk = () => {
    const {
      form: { getFieldsValue },
      onOk
    } = this.props;

    // 获取界面上的用户输入
    // 由于界面上没有 id 的输入框，所以直接从 model 中取出；
    const data: any = {
      ...getFieldsValue()
    };

    data.actual_cmp_date = moment(data.actual_cmp_date).format("YYYY-MM-DD");

    onOk(data);
  };

  public render() {
    const {
      form: { getFieldDecorator },
      item,
      visible,
      title,
      onCancel
    } = this.props;

    const modalOpts = {
      onOk: this.handleOk,
      onCancel,
      title,
      visible,
      wrapClassName: "vertical-center-modal",
      maskClosable: false
    };

    let actDate;
    if (_.isNil(item.actual_cmp_date) || item.actual_cmp_date === "") {
      actDate = moment(moment(), "YYYY-MM-DD");
    } else {
      actDate = moment(item.actual_cmp_date, "YYYY-MM-DD");
    }

    return (
      <div>
        <Modal {...modalOpts}>
          <Form layout="horizontal">
            {getFieldDecorator("id", {
              initialValue: item.id
            })(<Input type="hidden" />)}
            <FormItem label="状态" hasFeedback={true} {...formItemLayout}>
              {getFieldDecorator("status", {
                initialValue: item.status || "完成",
                rules: [
                  {
                    required: true
                  }
                ]
              })(
                <Select placeholder="任务状态">
                  <Option value="完成">完成</Option>
                  <Option value="取消">取消</Option>
                </Select>
              )}
            </FormItem>

            <FormItem label="确认时间" hasFeedback={true} {...formItemLayout}>
              {getFieldDecorator("actual_cmp_date", {
                initialValue: actDate,
                rules: [
                  {
                    required: true
                  }
                ]
              })(<DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />)}
            </FormItem>

            <FormItem label="详细说明" hasFeedback={true} {...formItemLayout}>
              {getFieldDecorator("memo", {
                initialValue: item.memo
              })(<TextArea rows={4} />)}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(TodoMark);
