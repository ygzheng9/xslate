import * as React from "react";

import { Button, DatePicker, Form, Input, Select } from "antd";

import * as _ from "lodash";
import * as moment from "moment";

import deptService from "@services/department";

import { ILoginUser } from "@components/collections/types";
import { IBizEvent } from "@services/apiResults";
import { FormComponentProps } from "@utils/shortcuts";

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

// Form 底部的 button 的布局，左边通过 offset 和内容对齐；
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 14,
      offset: 6
    }
  }
};

interface IEventFormProps extends FormComponentProps {
  item: IBizEvent;
  user: ILoginUser;
  modalType: string;
  onOk: (a: any) => void;
  onCancel: () => void;
  readOnly: boolean;
}

interface IEventFormStates {
  deptOptions: any;
}

class EventForm extends React.Component<IEventFormProps, IEventFormStates> {
  constructor(props: IEventFormProps) {
    super(props);

    this.state = {
      // 全部部门列表
      deptOptions: ""
    };
  }

  public async componentDidMount() {
    const s = await deptService.getDeptOptions();
    this.setState({ deptOptions: s });
  }

  public saveEntity = () => {
    const {
      form: { getFieldsValue },
      item,
      onOk
    } = this.props;

    // 获取界面上的用户输入
    const inputData: any = {
      ...getFieldsValue()
    };

    // 从自定义控件中，获取用户的名字
    // 自定义控件对应 user，是一个 object
    inputData.user_name = inputData.user.name;
    inputData.happen_at = moment(item.happen_at).format("YYYY-MM-DD HH:mm:ss");

    // console.log(inputData)
    // 调用后台 API 保存，使用 effects;
    // 保存后的页面跳转，在 effects 中处理；
    onOk(inputData);
  };

  public checkUser = (rule: any, value: any, callback: any) => {
    if (value.name.length > 0) {
      callback();
      return;
    }
    callback("请输入发起人!");
  };

  public render() {
    const {
      form: { getFieldDecorator },
      item,
      onOk,
      onCancel,
      user,
      readOnly
    } = this.props;

    let happenAt = moment(item.happen_at, "YYYY-MM-DD HH:mm:ss");
    if (_.isNil(item.happen_at)) {
      happenAt = moment(moment(), "YYYY-MM-DD HH:mm:ss");
    }

    // let owner = item.user_name
    // if ((_.isNil(item.user_name)) || (item.user_name === '')) {
    //   owner = user.name
    // }

    let owner = user.username;
    if ("user_name" in item) {
      owner = item.user_name;
    }

    const { deptOptions } = this.state;

    return (
      <div>
        <Form layout="horizontal">
          {getFieldDecorator("id", {
            initialValue: item.id
          })(<Input type="hidden" />)}
          <FormItem label="类型" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("type", {
              initialValue: item.type || "ECN",
              rules: [
                {
                  required: true
                }
              ]
            })(
              <Select placeholder="请选择类型" disabled={readOnly}>
                <Option value="会议">会议</Option>
                <Option value="ECN">ECN</Option>
                <Option value="工作计划">工作计划</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="部门" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("department", {
              initialValue: item.department || "质量部",
              rules: [
                {
                  required: true
                }
              ]
            })(
              <Select placeholder="请选择部门" disabled={readOnly}>
                {deptOptions}
              </Select>
            )}
          </FormItem>
          <FormItem label="发起人" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("user", {
              initialValue: { name: owner },
              rules: [{ validator: this.checkUser }]
            })(<Input disabled={readOnly} />)}
          </FormItem>
          <FormItem label="时间" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("happen_at", {
              initialValue: happenAt,
              rules: [{ required: true, message: "请选择时间" }]
            })(
              <DatePicker
                showTime={true}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select Time"
                onOk={onOk}
                style={{ width: 200 }}
                disabled={readOnly}
              />
            )}
          </FormItem>
          <FormItem label="主题" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("subject", {
              initialValue: item.subject,
              rules: [{ required: true, message: "请输入主题" }]
            })(<Input disabled={readOnly} />)}
          </FormItem>
          <FormItem label="地点" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("place", {
              initialValue: item.place
            })(<Input disabled={readOnly} />)}
          </FormItem>
          <FormItem label="料号信息" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("material_desc", {
              initialValue: item.material_desc
            })(<TextArea rows={4} disabled={readOnly} />)}
          </FormItem>

          <FormItem label="详细内容" hasFeedback={true} {...formItemLayout}>
            {getFieldDecorator("memo", {
              initialValue: item.memo
            })(<TextArea rows={4} disabled={readOnly} />)}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            {
              <div>
                {!readOnly && (
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={this.saveEntity}
                  >
                    保存
                  </Button>
                )}
                <Button htmlType="button" onClick={onCancel}>
                  返回
                </Button>
              </div>
            }
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(EventForm);
