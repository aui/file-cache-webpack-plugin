const each = (
  target,
  callback,
  key = '',
  context = target,
  cache = new Set(),
) => {
  callback.call(context, target, key, context);
  if (target !== null && typeof target === 'object' && !cache.has(target)) {
    cache.add(target);
    for (const index in target) {
      if (Object.prototype.hasOwnProperty.call(target, index)) {
        each(target[index], callback, index, target, cache);
      }
    }
  }
};

export default (target, callback) => each(target, callback);
