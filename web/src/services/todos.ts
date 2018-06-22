import { request } from "@utils/request";

const BASE_URL = "/api/todos";

export default {
  query: () => request(BASE_URL),

  setMatRule: (param: any) =>
    request(`${BASE_URL}_matrule`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  queryByParam: (param: any) =>
    request(`${BASE_URL}_search`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  queryByRef: (refItem: any) => {
    const byRef = `${BASE_URL}_byref`;
    return request(byRef, {
      method: "POST",
      body: JSON.stringify(refItem)
    });
  },

  mark: (item: any) => {
    const byRef = `${BASE_URL}_mark`;
    return request(byRef, {
      method: "POST",
      body: JSON.stringify(item)
    });
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
