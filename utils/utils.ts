function mergeObjs<T>(obj1: T, obj2: T) {
  for (const key in obj2) {
    if (obj2[key] !== undefined && obj2[key] !== null) {
      if (Array.isArray(obj2[key])) {
        obj1[key] = obj2[key];
      } else if (typeof obj2[key] === "object") {
        mergeObjs(obj1[key], obj2[key]);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
}

/**
 * 判断字符串是否为路径
 * @param str
 * @returns
 */
function isPath(str) {
  // 综合的路径正则表达式，包括文件路径和HTTP/HTTPS URL
  const pathRegex =
    /^(\/|\.\/|\.\.\/|[a-zA-Z]:\\|https?:\/\/|www\.)[^<>:"|?*]+$/;

  return pathRegex.test(str);
}

export { mergeObjs, isPath };
