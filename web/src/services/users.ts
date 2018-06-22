import { request } from "@utils/request";

export async function fetch() {
  return request("/api/users/");
}

export async function search(param: any) {
  // console.log(param)
  return request("/api/users_search", {
    method: "POST",
    body: JSON.stringify(param)
  });
}

export async function save(user: any) {
  // console.log('save user....')
  // console.log(user)

  if (user.id > 0) {
    // 更新用户
    return request("/api/users/", {
      method: "PUT",
      body: JSON.stringify(user)
    });
  }
  // 新建用户
  return request("/api/users/", {
    method: "POST",
    body: JSON.stringify(user)
  });
}

export async function remove(id: number) {
  // 根据 id 删除用户
  const cmd = `/api/users/${id}`;
  // console.log(cmd);

  return request(cmd, {
    method: "DELETE"
  });
}
