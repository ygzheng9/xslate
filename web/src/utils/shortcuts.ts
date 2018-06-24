// DVA 和 antd 通用的 类型定义

import { EffectsCommandMap, Model, SubscriptionAPI } from "dva";

// import { DOMAttributes, TextareaHTMLAttributes } from "react";
// import { SelectProps } from "antd/lib/select";
// import { RangePickerProps } from "antd/lib/date-picker/interface";

import { Table, Upload } from "antd";
import { RangePickerValue } from "antd/lib/date-picker/interface";
import { FormComponentProps } from "antd/lib/form";
import { SelectValue } from "antd/lib/select";
import { ColumnProps } from "antd/lib/table";

import { Moment } from "moment";

///////////////////
// dva 中 action 类型
// tslint:disable-next-line:interface-name
interface ZDvaAction {
  type: string;
  payload?: any;
}

// dva 中 dispatch 类型
type ZDvaDispatch = (action: ZDvaAction) => any;

// 被 connect 修饰后的组件
// tslint:disable-next-line:interface-name
interface ZConnectedComponent {
  dispatch: ZDvaDispatch;
}

// 返回 dispatch 中 type 字符串
function ZActionType(model: string, method: string) {
  return `${model}/${method}`;
}

export {
  EffectsCommandMap,
  Model,
  SubscriptionAPI,
  ZDvaAction,
  ZDvaDispatch,
  ZConnectedComponent,
  ZActionType
};

/////////////////////////////////////////
// html 的 event handler
// export type InputOnChange = DOMAttributes<HTMLInputElement>["onChange"];
export type InputOnChange = (event: React.FormEvent<HTMLInputElement>) => void;

// export type TextareaOnChange = TextareaHTMLAttributes<
//   HTMLTextAreaElement
// >["onChange"];

export type TextareaOnChange = (
  event: React.ChangeEvent<HTMLTextAreaElement>
) => void;

// export type ButtonOnClick = DOMAttributes<HTMLButtonElement>["onClick"];
export type ButtonOnClick = (
  event: React.MouseEvent<HTMLButtonElement>
) => void;

// export type SelectOnChange = SelectProps["onChange"];
export type SelectOnChange = (
  value: SelectValue,
  option: React.ReactElement<any> | Array<React.ReactElement<any>>
) => void;
export { SelectValue, FormComponentProps };

// export type DateRangeOnChange = RangePickerProps["onChange"];
export type DateRangeOnChange = (
  dates: RangePickerValue,
  dateStrings: [string, string]
) => void;

export type BeforeUploadAction = Upload["beforeUpload"];

export type RangeValue = [Moment, Moment];

export type TypedColumn<T> = Array<ColumnProps<T>>;

export function TypedTable<T>() {
  return class extends Table<T> {};
}

///////////////////////////
// 获取函数参数的类型
// 使用到了 conditinal type infer
type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
  ? U
  : any;

type SecondArgument<T> = T extends (
  arg1: any,
  arg2: infer U,
  ...args: any[]
) => any
  ? U
  : any;

// ZWrap1 把 (a) => void 转变成 (a) => () => void
export function ZWrap1<T extends (args: any) => void>(fn: T) {
  return (arg1: FirstArgument<T>) => () => fn(arg1);
}

export function ZWrap2<T extends (...args: any[]) => void>(fn: T) {
  return (arg1: FirstArgument<T>, arg2: SecondArgument<T>) => () =>
    fn(arg1, arg2);
}
