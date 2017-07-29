/* eslint-disable no-new-func, no-new-wrappers, no-console */
import each from './object-each';

const REFERENCE = '@REF:';
const UNKNOWN = '@UNKNOWN';

export const encode = (target, rules = encode.rules) => {
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


export const decode = (target, rules = decode.rules) => {
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


encode.rules = {};
decode.rules = {};
encode.rules.Object = value => value;
decode.rules.Object = value => value;
encode.rules.Array = value => value;
decode.rules.Array = value => value;
encode.rules.Function = value => [value.toString()];
decode.rules.Function = value => new Function(`return ${value[0]}`)();
encode.rules.Set = value => [...value];
decode.rules.Set = value => new Set(value);
encode.rules.Map = value => [...value];
decode.rules.Map = value => new Map(value);
encode.rules.RegExp = value => [value.source, value.flags];
decode.rules.RegExp = value => new RegExp(value[0], value[1]);
encode.rules.Date = value => [value.toString()];
decode.rules.Date = value => new Date(value[0]);
encode.rules.Buffer = value => [JSON.stringify(value)];
decode.rules.Buffer = value => new Buffer(JSON.parse(value[0]));
encode.rules.String = value => [value.toString()];
decode.rules.String = value => new String(value[0]);
encode.rules.Number = value => [value];
decode.rules.Number = value => new Number(value[0]);
encode.rules.Boolean = value => [value];
decode.rules.Boolean = value => new Boolean(value[0]);
// TODO Infinity Symbol WeakMap WeakSet

decode.rules[UNKNOWN] = (value, key) => new Proxy(value, {
  get(target, name) {
    if (Reflect.has(target, name)) {
      return Reflect.get(target, name);
    }
    throw new ReferenceError(`\`${key}['${name}']\` does not support decoding`);
  },
  set(target, name, val) {
    Reflect.set(target, name, val);
    return true;
  },
});

