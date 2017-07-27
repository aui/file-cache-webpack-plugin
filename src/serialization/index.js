/* eslint-disable no-new-func */
import each from './object-each';
import clone from './object-clone';

const REFERENCE = '@REF:';
const UNKNOWN = '@UNKNOWN';

export const encode = (target, rules = encode.rules) => {
  const references = [];
  const cache = {
    keys: [],
    values: [],
    types: [],
  };

  each(target, (value, key, context) => {
    const name = typeof value;
    if (value !== null && (name === 'object' || name === 'function')) {
      const type = (value.constructor && value.constructor.name) || Object.prototype.toString.call(value).slice(8, -1);
      let reference = cache.values.indexOf(value);
      if (reference === -1) {
        reference = cache.values.length;
        cache.keys.push(key);
        cache.values.push(value);
        cache.types.push(type);
      }
      references.push({
        context: cache.values.indexOf(context),
        key,
        reference,
      });
    }
  });

  cache.values.forEach((value, index, context) => {
    const type = cache.types[index];
    const key = cache.keys[index];
    const convertor = rules[type] || rules.Object;
    context[index] = clone(convertor(value, key)); // eslint-disable-line no-param-reassign
  });

  references.shift();
  references.forEach(({ context, key, reference }) => {
    cache.values[context][key] = `${REFERENCE}${reference}`;
  });

  return cache;
};


export const decode = (target, rules = decode.rules) => {
  ['values', 'keys', 'types'].forEach((name) => {
    if (!Array.isArray(target[name])) {
      throw new Error(`invalid format \`${name}\``);
    }
  });

  const references = [];
  each(target.values, (value, key, context) => {
    if (typeof value === 'string' && value.indexOf(REFERENCE) === 0) {
      references.push({
        context: target.values.indexOf(context),
        key,
        reference: value.split(REFERENCE)[1],
      });
    }
    return value;
  });

  const values = [];
  target.values.forEach((value, index) => {
    const type = target.types[index];
    const convertor = rules[type] || rules[UNKNOWN];
    const key = target.keys[index];
    values[index] = convertor(clone(value), key);
  });

  references.forEach(({ context, key, reference }) => {
    const object = values[reference];
    if (!object) {
      throw new ReferenceError(`can not find a reference: ${reference}`);
    }
    values[context][key] = object;
  });

  return values[0];
};


encode.rules = {};
decode.rules = {};
encode.rules.Object = value => value;
decode.rules.Object = value => value;
encode.rules.Array = value => value;
decode.rules.Array = value => value;
encode.rules.Function = value => value.toString();
decode.rules.Function = value => new Function(`return ${value}`)();
encode.rules.Set = value => [...value];
decode.rules.Set = value => new Set(value);
encode.rules.Map = value => [...value];
decode.rules.Map = value => new Map(value);
encode.rules.RegExp = value => [value.source, value.flags];
decode.rules.RegExp = value => new RegExp(value[0], value[1]);
encode.rules.Date = value => value.toString();
decode.rules.Date = value => new Date(value);
encode.rules.Buffer = value => JSON.stringify(value);
decode.rules.Buffer = value => new Buffer(JSON.parse(value));

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

