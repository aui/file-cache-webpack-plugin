const map = (
  target,
  callback,
  key = '',
  context = target,
  cache = new Set(),
) => {
  const result = callback.call(context, target, key, context);
  if (result !== null && typeof result === 'object' && !cache.has(result)) {
    cache.add(result);
    const object = Array.isArray(result) ? [] : {};
    for (const index in result) {
      if (Object.prototype.hasOwnProperty.call(result, index)) {
        object[index] = map(result[index], callback, index, result, cache);
      }
    }
    return object;
  }
  return result;
};

export default (target, callback) => map(target, callback);
