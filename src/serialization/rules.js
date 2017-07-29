/* eslint-disable no-new-func, no-new-wrappers */
export const encode = {};
export const decode = {};

encode.Object = value => value;
decode.Object = value => value;
encode.Array = value => value;
decode.Array = value => value;
encode.Function = value => [value.toString()];
decode.Function = value => new Function(`return ${value[0]}`)();
encode.Set = value => [...value];
decode.Set = value => new Set(value);
encode.Map = value => [...value];
decode.Map = value => new Map(value);
encode.RegExp = value => [value.source, value.flags];
decode.RegExp = value => new RegExp(value[0], value[1]);
encode.Date = value => [value.toString()];
decode.Date = value => new Date(value[0]);
encode.Buffer = value => [JSON.stringify(value)];
decode.Buffer = value => new Buffer(JSON.parse(value[0]));
encode.String = value => [value.toString()];
decode.String = value => new String(value[0]);
encode.Number = value => [value];
decode.Number = value => new Number(value[0]);
encode.Boolean = value => [value];
decode.Boolean = value => new Boolean(value[0]);
// TODO Infinity Symbol WeakMap WeakSet

decode['@UNKNOWN'] = (value, key) => new Proxy(value, {
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
