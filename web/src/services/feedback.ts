import { request } from "@utils/request";

const BASE_URL = "/api/feedback";

export default {
  // 每个 feedback 都有一个父元素，refItem，这里参数是 refItem
  queryByRef: (param: any) => {
    const refURL = `${BASE_URL}_ref`;
    return request(refURL, {
      method: "POST",
      body: JSON.stringify(param)
    });
  },

  query: () => request(BASE_URL),

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
    if (id > 0) {
      // 根据 id 删除
      const cmd = `${BASE_URL}/${id}`;
      console.log(cmd);

      return request(cmd, {
        method: "DELETE"
      });
    }
    return "";
  }
};
