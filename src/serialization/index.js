/* eslint-disable no-new-func, no-new-wrappers, no-console */
import each from './object-each';
import { encode as encodeRules, decode as decodeRules } from './rules';

const REFERENCE = '@REF:';
const UNKNOWN = '@UNKNOWN';

export const encode = (target, rules = encodeRules) => {
  console.time('serialization.encode()');
  const cache = new Map();
  const result = {
    keys: [],
    values: [],
    types: [],
  };

  each(target, (value, key, context) => {
    const name = typeof value;
    if (value !== null && (name === 'object' || name === 'function')) {
      let reference = cache.get(value);
      const type = (value.constructor && value.constructor.name) || Object.prototype.toString.call(value).slice(8, -1);
      if (typeof reference !== 'number') {
        const val = (rules[type] || rules.Object)(value, key);
        const clone = Object.assign(Array.isArray(val) ? [] : {}, val);
        reference = result.values.length;
        cache.set(value, reference);
        result.keys.push(key);
        result.values.push(clone);
        result.types.push(type);
      }
      if (key !== null) {
        result.values[cache.get(context)][key] = `${REFERENCE}${reference}`;
      }
    }
  });
  console.timeEnd('serialization.encode()');
  return result;
};


export const decode = (target, rules = decodeRules) => {
  console.time('serialization.decode()');
  ['values', 'keys', 'types'].forEach((name) => {
    if (!Array.isArray(target[name])) {
      throw new Error(`invalid format \`${name}\``);
    }
  });

  const cache = target.values.map((value, index) => {
    const type = target.types[index];
    const convertor = rules[type] || rules[UNKNOWN];
    const key = target.keys[index];
    const clone = Object.assign(Array.isArray(value) ? [] : {}, value);
    return convertor(clone, key);
  });

  for (const object of cache) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key];
        if (typeof value === 'string' && value.indexOf(REFERENCE) === 0) {
          const [, reference] = value.split(REFERENCE);
          object[key] = cache[reference];
          if (!object[key]) {
            throw new ReferenceError(`"${key}": can not find a reference: ${reference}`);
          }
        }
      }
    }
  }
  console.timeEnd('serialization.decode()');
  return cache[0];
};
