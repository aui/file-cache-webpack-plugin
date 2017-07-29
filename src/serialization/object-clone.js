export default (target) => {
  const result = Array.isArray(target) ? [] : {};
  const cache = new WeakSet();
  const keys = target[Symbol.iterator] ? [...target.keys()] : Object.keys(target);
  const contexts = keys.map(k => [target[k], k, result]);

  while (contexts.length) {
    const [value, key, context] = contexts.shift();
    if (value !== null && typeof value === 'object' && !cache.has(value)) {
      cache.add(value);
      const clone = Array.isArray(value) ? [] : {};
      const indexs = value[Symbol.iterator] ? [...value.keys()] : Object.keys(value);
      contexts.push(...indexs.map(k => [value[k], k, clone]));
      context[key] = clone;
    } else {
      context[key] = value;
    }
  }
  return result;
};
