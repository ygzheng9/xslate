import * as React from "react";

import { Select } from "antd";

import { request } from "@utils/request";

const Option = Select.Option;

const BASE_URL = "/api/departments";

export default {
  getAll: () => request(BASE_URL),

  save: (entity: any) => {
    if (entity.id > 0) {
      // 更新
      return request(BASE_URL, {
        method: "PUT",
        body: JSON.stringify(entity)
      });
    }
    // 新建
    return request(BASE_URL, {
      method: "POST",
      body: JSON.stringify(entity)
    });
  },

  remove: (id: number) => {
    // 根据 id 删除
    const cmd = `${BASE_URL}/${id}`;
    // console.log(cmd);

    return request(cmd, {
      method: "DELETE"
    });
  },

  getDeptOptions: async () => {
    const result = await request(BASE_URL);
    if ("err" in result) {
      return;
    }

    const data = result.data;
    if (data.rtnCode !== 0) {
      console.log("获取部门清单发生错误");
      return "";
    }

    const deptOptions = data.items.map((d: any) => (
      <Option key={d.id} value={d.name}>
        {d.name}
      </Option>
    ));

    return deptOptions;
  },

  // 为部门批量增加员工
  batchAddSubs: (param: any) =>
    request(`${BASE_URL}_batchAddSubs`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  // 清除员工的部门
  removeSub: (param: any) =>
    request(`${BASE_URL}_removeSub`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  // 加载全部关系
  loadViewers: () => request(`${BASE_URL}_viewers`),

  // 批量建立关系
  batchAddViewers: (param: any) =>
    request(`${BASE_URL}_batchAddViewers`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  // 移除关系
  removeViewer: (param: any) =>
    request(`${BASE_URL}_removeViewer`, {
      method: "POST",
      body: JSON.stringify(param)
    })
};
