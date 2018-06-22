import { request } from "@utils/request";

const BASE_URL = "/api/syslogs";

export default {
  query: () => request(BASE_URL)
};
