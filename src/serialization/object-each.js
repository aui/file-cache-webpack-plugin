export default (target, callback) => {
  callback.call(target, target, null, target);

  const cache = new WeakSet();
  const keys = target[Symbol.iterator] ? [...target.keys()] : Object.keys(target);
  const contexts = keys.map(k => [target[k], k, target]);

  while (contexts.length) {
    const [value, key, context] = contexts.shift();
    callback.call(context, value, key, context);
    if (value !== null && typeof value === 'object' && !cache.has(value)) {
      cache.add(value);
      const indexs = value[Symbol.iterator] ? [...value.keys()] : Object.keys(value);
      contexts.push(...indexs.map(k => [value[k], k, value]));
    }
  }
};
