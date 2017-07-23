/* eslint-disable no-new-func */
let ID = 0;
const METDATA = '<METDATA>';
const getType = value => (Object.prototype.toString.call(value).slice(8, -1));
const toType = (value, type) => `<${type}>${value}`;
const toValue = value => (new Function(`return ${value}`)());


export default class Serialization {
  constructor(constructors = {}) {
    this.constructors = constructors;
    this.map = new Map();
  }

  stringify(object) {
    const { constructors, map } = this;
    return JSON.stringify(object, function encode(key) {
      return Serialization.encode({ key, value: this[key], context: this, constructors, map });
    });
  }

  parse(object) {
    const { constructors, map } = this;
    return JSON.parse(object, function decode(key, value) {
      return Serialization.decode({ key, value, context: this, constructors, map });
    });
  }

  static encode(options) {
    const type = getType(options.value);
    const convertor = Serialization[`encode:${type}`];
    if (convertor) {
      return convertor(options);
    }
    throw new Error(`"${options.key}" encoding failed because the "${type}" type is not supported`);
  }

  static decode(options) {
    const type = getType(options.value);
    const convertor = Serialization[`decode:${type}`];
    if (convertor) {
      return convertor(options);
    }
    throw new Error(`"${options.key}" decoding failed because the "${type}" type is not supported`);
  }

  static getId(object) {
    if (!Serialization.getMetdata(object, 'id')) {
      ID += 1;
      Serialization.addMetdata(object, 'id', `object:${ID}`);
    }
    return Serialization.getMetdata(object, 'id');
  }

  static addMetdata(object, key, value) {
    /* eslint-disable no-param-reassign */
    if (!object[METDATA]) {
      object[METDATA] = {};
    }
    object[METDATA][key] = value;
  }

  static getMetdata(object, key) {
    if (object[METDATA]) {
      return object[METDATA][key];
    }
    return null;
  }

  static removeMetdata(object, key) {
    if (object[METDATA]) {
      if (key) {
        delete object[METDATA][key];
      } else {
        delete object[METDATA];
      }
    }
  }

  static ['encode:RegExp']({ value }) { return toType(value, 'RegExp'); }
  static ['encode:Date']({ value }) { return toType(value, 'Date'); }
  // static ['encode:Set']({ value }) { return toType([...value], 'Set'); }
  // static ['encode:Map']({ value }) { return toType([...value], 'Map'); }
  static ['encode:Undefined']({ value }) { return value; }
  static ['encode:Null']({ value }) { return value; }
  static ['encode:String']({ value }) { return value; }
  static ['encode:Number']({ value }) { return value; }
  static ['encode:Boolean']({ value }) { return value; }
  static ['encode:Array']({ value }) { return value; }
  static ['encode:Object']({ value, key, constructors, map }) {
    if (key === METDATA) {
      return value;
    }

    const { name } = value.constructor;
    const id = Serialization.getId(value);

    if (map.has(id)) {
      Serialization.addMetdata(value, 'dependent', true);
      return toType(id, 'ObjectDependencie');
    }

    if (typeof constructors[name] === 'function') {
      Serialization.addMetdata(value, 'constructor', name);
    } else if (name !== 'Object') {
      throw new Error(`"${key}" encoding failed because the "${name}" type is not supported`);
    }
    map.set(id, value);
    return value;
  }

  static ['decode:RegExp']({ value }) { return toValue(value); }
  static ['decode:Date']({ value }) { return new Date(value); }
  // static ['decode:Set']({ value }) { return new Set(toValue(value)); }
  // static ['decode:Map']({ value }) { return new Map(toValue(value)); }
  static ['decode:Undefined']() { }
  static ['decode:Null']() { return null; }
  static ['decode:String'](options) {
    const regex = /^<([A-Z]\w+)>([\w\W]*)$/;
    const match = options.value.match(regex) || [];
    const [, type, value] = match;
    const convertor = type && Serialization[`decode:${type}`];
    if (convertor) {
      options.value = value;
      return convertor(options);
    }
    return options.value;
  }
  static ['decode:Number']({ value }) { return value; }
  static ['decode:Boolean']({ value }) { return value; }
  // TODO dependent
  static ['decode:Array']({ value }) { return value; }
  static ['decode:Object']({ value, key, constructors, map }) {
    if (key === METDATA) {
      return value;
    }

    const name = Serialization.getMetdata(value, 'constructor');
    const id = Serialization.getId(value);

    if (typeof name === 'string') {
      if (typeof constructors[name] === 'function') {
        Object.setPrototypeOf(value, constructors[name].prototype);
      } else if (name !== 'Object') {
        throw new Error(`"${key}" decoding failed because the "${name}" type is not supported`);
      }
    }

    if (Serialization.getMetdata(value, 'dependent')) {
      map.set(id, value);
    }

    return value;
  }
  static ['decode:ObjectDependencie']({ value, key, map, context }) {
    const id = value;
    const temp = context[key];
    if (map.has(id)) {
      return map.get(id);
    }
    Object.defineProperty(context, key, {
      get() {
        return map.get(id);
      },
      set(newValue) {
        if (!temp) {
          map.set(id, newValue);
        }
      },
    });
    return temp;
  }
}
