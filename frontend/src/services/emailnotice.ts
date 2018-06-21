import { request } from "@utils/request";

export default {
  // 根据 param ，返回 email 列表
  listMails: (param: any) =>
    request("/api/listMails", {
      method: "POST",
      body: JSON.stringify(param)
    }),

  // 物料提醒
  listMatNotice: () => request("/api/listMatNotice")
};
