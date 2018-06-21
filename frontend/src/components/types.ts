import { DOMAttributes } from "react";

import { SelectProps, SelectValue } from "antd/lib/select";

import { RangePickerProps } from "antd/lib/date-picker/interface";
import { Moment } from "moment";

// feedback, attachment 的父元素
export interface IRefItem {
  ref_type: string;
  ref_id: number;
  ref_title: string;
}

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

// 输入框的 onChange 事件
// TODO: textarea 不可用
export type OnInputChange = (e: React.FormEvent<HTMLInputElement>) => void;

// 父元素操作，refItem
export type RefItemFunc = (e: IRefItem) => void;

// html 的 event handler
export type ButtonOnClick = DOMAttributes<HTMLButtonElement>["onClick"];

export type SelectOnChange = SelectProps["onChange"];
export { SelectValue };

export type InputOnChange = DOMAttributes<HTMLInputElement>["onChange"];

export type DateRangeOnChange = RangePickerProps["onChange"];

export type RangeValue = [Moment, Moment];
