/* global window */
import { request } from "@utils/request";

const BASE_URL = "/api/uploads";

export default {
  query: () => request(BASE_URL),

  queryByRef: (refItem: any) => {
    const byRef = `${BASE_URL}_byref`;
    return request(byRef, {
      method: "POST",
      body: JSON.stringify(refItem)
    });
  },

  // 下载附件
  downloadFile: (id: any) => {
    const urlCmd = `/api/uploads_download/${id}`;
    console.log(urlCmd);
    window.location.href = urlCmd;
  },

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
  }
};
