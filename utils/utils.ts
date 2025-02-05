function mergeObjs<T>(obj1: T, obj2: T) {
  for (const key in obj2) {
    if (obj2[key] !== undefined && obj2[key] !== null) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}
export { mergeObjs };
