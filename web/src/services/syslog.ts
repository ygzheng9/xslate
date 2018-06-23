import { request } from "@utils/request";

import axios from "axios";

const BASE_URL = "/api/syslogs";

export default {
  query: () => request(BASE_URL),

  query2: () => axios.get(BASE_URL),

  queryByParam: (param: any) => axios.post(BASE_URL, param)
};
