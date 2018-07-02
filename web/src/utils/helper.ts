// antd table 中使用的 sorter
export const stringSorter = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }

  if (a > b) {
    return 1;
  }

  return -1;
};

// 检查 user 是否有 key 的权限
export function checkPermission(key: string, user: any) {
  // 正常逻辑
  // if ("permissions" in user) {
  //   const permissions = user.permissions;
  //   if (permissions.indexOf(key) !== -1) {
  //     return true;
  //   }
  // }

  // return false;

  // 演示逻辑，全权限
  return true;
}

// 日期的统一格式
export const dateFormat = "YYYY-MM-DD";
