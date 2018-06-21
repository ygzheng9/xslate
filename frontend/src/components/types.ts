import { DOMAttributes, TextareaHTMLAttributes } from "react";

import { Upload } from "antd";
import { RangePickerProps } from "antd/lib/date-picker/interface";
import { FormComponentProps } from "antd/lib/form";
import { SelectProps, SelectValue } from "antd/lib/select";
import { ColumnProps } from "antd/lib/table";

import { Moment } from "moment";

/////////////////////////////////////////
// html 的 event handler
export type InputOnChange = DOMAttributes<HTMLInputElement>["onChange"];

export type TextareaOnChange = TextareaHTMLAttributes<
  HTMLTextAreaElement
>["onChange"];

export type ButtonOnClick = DOMAttributes<HTMLButtonElement>["onClick"];

export type SelectOnChange = SelectProps["onChange"];
export { SelectValue, FormComponentProps };

export type DateRangeOnChange = RangePickerProps["onChange"];

export type BeforeUploadAction = Upload["beforeUpload"];

export type RangeValue = [Moment, Moment];

export type TypedColumn<T> = Array<ColumnProps<T>>;

//////////////////////////////////////////

// feedback, attachment 的父元素
export interface IRefItem {
  ref_type: string;
  ref_id: number;
  ref_title: string;
}

// 父元素操作，refItem
export type RefItemOp = (e: IRefItem) => void;

///////////////////
// 本地 API 返回的数据
// 一个 attachment 对象
export interface IAttchItem extends IRefItem {
  id: number;
  file_name: string;
  content: string;
  file_location: string;
  create_user: string;
  create_date: string;
}

// 一个 feedback
export interface IComment extends IRefItem {
  id: number;
  comment: string;
  create_user: string;
  create_date: string;
}

// 一个 todo item
export interface ITodoItem extends IRefItem {
  id: number;
  seq: number;
  content: string;
  owner_id: number;
  owner_name: string;
  due_date: string;
  status: string;
  actual_cmp_date: string;
  memo: string;
  create_user: string;
  create_date: string;
  update_user: string;
  update_date: string;
  mat_rule: string;
  mat_code: string;
  mat_cond: string;
}

// 一个 event
export interface IBizEvent {
  id: number;
  type: string;
  department: string;
  user_id: number;
  user_name: string;
  happen_at: string;
  place: string;
  subject: string;
  memo: string;
  create_user: string;
  create_date: string;
  update_user: string;
  update_date: string;
  material_desc: string;
  event_status: string;
  open_cnt: number;

  // 列表显示的排序号
  seq_no?: number;
}
