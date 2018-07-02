import * as React from "react";

import { DatePicker, Form, Input, Modal } from "antd";

import * as _ from "lodash";
import * as moment from "moment";

// import SearchUser from 'components/common/selectuser';

import { ITodoItem } from "@services/apiResults";
import { FormComponentProps } from "@utils/shortcuts";

const FormItem = Form.Item;
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

interface ITodoFormProps extends FormComponentProps {
  item: ITodoItem;
  visible: boolean;
  title: string;
  onOk: (a: any) => void;
  onCancel: () => void;
}
class TodoForm extends React.Component<ITodoFormProps, any> {
  constructor(props: ITodoFormProps) {
    super(props);
  }

  // public checkUser = (rule: any, value: any, callback: any) => {
  //   // console.log("value: ", value);
  //   if (value.length > 0) {
  //     callback();
  //     return;
  //   }
  //   callback("请输入发起人!");
  // };

  // 点击确定
  public handleOk = async () => {
    const {
      form: { getFieldsValue },
      onOk
    } = this.props;

    // 获取界面上的用户输入
    // 由于界面上没有 id 的输入框，所以直接从 model 中取出；
    const data: any = {
      ...getFieldsValue()
    };

    // 从自定义的控件中，获取责任人的名字
    // data.owner_name = data.owner.name;
    data.due_date = moment(data.due_date).format("YYYY-MM-DD");

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

    let dueDate = moment(item.due_date, "YYYY-MM-DD");
    if (_.isNil(item.due_date)) {
      dueDate = moment(moment(), "YYYY-MM-DD");
    }

    const modalOpts = {
      onOk: this.handleOk,
      onCancel,
      title,
      visible,
      wrapClassName: "vertical-center-modal",
      maskClosable: false
    };

    return (
      <div>
        <Modal {...modalOpts}>
          <Form layout="horizontal">
            {getFieldDecorator("id", {
              initialValue: item.id
            })(<Input type="hidden" />)}
            <FormItem label="责任人" hasFeedback={true} {...formItemLayout}>
              {getFieldDecorator("owner_name", {
                initialValue: item.owner_name,
                rules: [{ required: true, message: "请输入责任人" }]
              })(<Input />)}
            </FormItem>

            <FormItem label="工作描述" hasFeedback={true} {...formItemLayout}>
              {getFieldDecorator("content", {
                initialValue: item.content,
                rules: [
                  {
                    required: true,
                    message: "请输入具体的工作描述"
                  }
                ]
              })(<TextArea rows={4} />)}
            </FormItem>

            <FormItem
              label="要求完成时间"
              hasFeedback={true}
              {...formItemLayout}
            >
              {getFieldDecorator("due_date", {
                initialValue: dueDate,
                rules: [
                  {
                    required: true
                  }
                ]
              })(<DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />)}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(TodoForm);
