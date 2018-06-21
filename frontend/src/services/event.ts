import { request } from "@utils/request";

const BASE_URL = "/api/events";

export default {
  getAll: () => request(BASE_URL),

  searchByParam: (param: any) =>
    request(`${BASE_URL}_search`, {
      method: "POST",
      body: JSON.stringify(param)
    }),

  save: (entity: any) => {
    // console.log('save ....')
    // console.log(entity)

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
    console.log(cmd);

    return request(cmd, {
      method: "DELETE"
    });
  },

  notify: (id: number) => request(`${BASE_URL}_notify/${id}`),

  closeEvent: (id: number) => request(`${BASE_URL}_close/${id}`)
};
