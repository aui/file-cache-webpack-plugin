/* eslint-disable no-new-func */
let ID = 0;
const METDATA = '<METDATA>';
const getType = value => (Object.prototype.toString.call(value).slice(8, -1));
const toType = (type, value) => `<${type}>${value}`;
const toValue = value => (Function(`return ${value}`)());


export default class Serialization {
  constructor(constructors = {}) {
    this.constructors = constructors;
    this.map = new Map();
  }

  stringify(object) {
    const { constructors, map } = this;
    return JSON.stringify(object, function encode(key, value) {
      return Serialization.encode({ key, value, context: this, constructors, map });
    });
  }

  parse(object) {
    const { constructor, map } = this;
    return JSON.parse(object, function decode(key, value) {
      return Serialization.decode({ key, value, context: this, constructor, map });
    });
  }

  static encode(options) {
    const type = getType(options.value);
    const convertor = Serialization[`encode:${type}`];
    if (convertor) {
      return convertor(options);
    }
    throw new Error(`"${options.key}" could not be encoded`);
  }

  static decode(options) {
    const type = getType(options.value);
    const convertor = Serialization[`decode:${type}`];
    if (convertor) {
      return convertor(options);
    }
    throw new Error(`"${options.key}" could not be decoded`);
  }

  static getId(object) {
    if (!Serialization.getMetdata(object, 'id')) {
      ID += 1;
      Serialization.addMetdata(object, 'id', ID);
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

  static ['encode:RegExp']({ value }) { return toType(value); }
  static ['encode:Date']({ value }) { return toType(value); }
  static ['encode:Set']({ value }) { return toType([...value]); }
  static ['encode:Map']({ value }) { return toType([...value]); }
  static ['encode:Undefined']({ value }) { return value; }
  static ['encode:Null']({ value }) { return value; }
  static ['encode:String']({ value }) { return value; }
  static ['encode:Number']({ value }) { return value; }
  static ['encode:Boolean']({ value }) { return value; }
  static ['encode:Array']({ value }) { return value; }
  static ['encode:Object']({ value, key, constructors, map }) {
    const { name } = value.constructor;
    const id = Serialization.getId(value);

    if (map.has(id)) {
      Serialization.addMetdata(value, 'dependent', true);
      return toType('ObjectDependencie', id);
    }

    if (typeof constructors[name] === 'function') {
      Serialization.addMetdata(value, 'constructor', name);
    } else if (name !== 'Object') {
      throw new Error(`\`"${key}": <Object ${name}>\` could not be encoded`);
    }
    map.set(id, value);
    return value;
  }

  static ['decode:RegExp']({ value }) { return toValue(value); }
  static ['decode:Date']({ value }) { return Date(value); }
  static ['decode:Set']({ value }) { return Set(toValue(value)); }
  static ['decode:Undefined']({ value }) { return value; }
  static ['decode:Null']({ value }) { return value; }
  static ['decode:String'](options) {
    const regex = /^<([A-Z]\w+)>([\w\W]*)$/;
    const match = options.value.match(regex) || [];
    const [type, value] = match;
    const convertor = type && Serialization[`decode:${type}`];
    if (convertor) {
      options.value = value;
      return convertor(options);
    }
    return options.value;
  }
  static ['decode:Number']({ value }) { return value; }
  static ['decode:Boolean']({ value }) { return value; }
  static ['decode:Array']({ value }) { return value; }
  static ['decode:Object']({ value, key, constructors, map }) {
    const name = Serialization.getMetdata(value, 'constructor');
    const id = Serialization.getId(value);

    if (typeof name === 'string' && typeof constructors[name] === 'function') {
      Object.setPrototypeOf(value, constructors[name].prototype);
    } else if (name !== 'Object') {
      throw new Error(`\`"${key}": <Object ${name}>\` could not be decoded`);
    }

    if (Serialization.getMetdata(value, 'dependent')) {
      map.set(id, value);
    }

    return value;
  }
  static ['decode:ObjectDependencie']({ value, key, map }) {
    const id = value;
    const temp = '#ObjectDependencie#';
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
