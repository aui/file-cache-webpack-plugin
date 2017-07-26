/* eslint-disable no-shadow */
import { encode, decode } from '../src/serialization';

describe('serialization data', () => {
  const stringify = (target, rules) => JSON.stringify(encode(target, rules));
  const parse = (target, rules) => decode(JSON.parse(target), rules);

  it('Should have the core functionality of `JSON`', () => {
    const data = {
      string: '',
      number: 1,
      null: null,
      boolean: true,
      array: [{ string: '' }],
      object: { string: '' },
    };
    const string = stringify(data);
    const json = parse(string);
    expect(json.string).toBe(data.string);
    expect(json.number).toBe(data.number);
    expect(json.null).toBe(data.null);
    expect(json.boolean).toBe(data.boolean);
    expect(json.array[0].string).toBe(data.array[0].string);
    expect(json.object.string).toBe(data.object.string);
  });

  it('Unsupported types should be error', () => {
    class Test {
      value() {
        return this._value;
      }
    }
    const data = {
      test: new Test(),
    };
    const string = stringify(data);
    const json = parse(string);
    expect(() => json.test.value).toThrowErrorMatchingSnapshot();
  });

  it('Should support the circular structure', () => {
    const data = {
      child: {
        id: '2',
        child: {
          id: '3',
        },
      },
      id: '1',
    };
    data.self = data;
    data.child.parent = data;
    data.child.self = data.child;
    data.child.child.parent = data.child;
    data.child.child.self = data.child.child;

    data.childs = [data.child, data.child.child];
    data.child.child.parents = [data.child, data];

    const json = parse(stringify(data));
    expect(json.self.id).toBe(json.id);
    expect(json.child.parent.id).toBe(json.id);
    expect(json.child.self.id).toBe(json.child.id);
    expect(json.child.child.parent.id).toBe(json.child.id);
    expect(json.child.child.self.id).toBe(json.child.child.id);

    expect(json.childs[0].id).toBe(json.child.id);
    expect(json.childs[1].id).toBe(json.child.child.id);
    expect(json.child.child.parents[0].id).toBe(json.child.id);
    expect(json.child.child.parents[1].id).toBe(json.id);
  });

  it('Should support the whitelist `class`', () => {
    class RawSource {
      constructor(path, source) {
        this._path = path;
        this._raw = source;
      }
      path() {
        return this._path;
      }
      source() {
        return this._raw;
      }
    }
    decode.rules.RawSource = (value) => {
      Object.setPrototypeOf(value, RawSource.prototype);
      return value;
    };
    const data = {
      file: new RawSource('/hello.js', '🍪'),
    };
    const json = parse(stringify(data));
    expect(json.file instanceof RawSource).toBe(true);
    expect(json.file.path()).toBe(data.file.path());
    expect(json.file.source()).toBe(data.file.source());
  });

  describe('Support native class', () => {
    it('Should support `RegExp`', () => {
      const data = {
        regexp: /^\s+$/ig,
      };
      const string = stringify(data);
      const json = parse(string);
      expect(json.regexp).not.toBe(data.regexp);
      expect(json.regexp instanceof RegExp).toBe(true);
      expect(json.regexp.toString()).toBe(data.regexp.toString());
    });
    it('Should support `Date`', () => {
      const data = {
        date: new Date(),
      };
      const string = stringify(data);
      const json = parse(string);
      expect(json.date).not.toBe(data.date);
      expect(json.date instanceof Date).toBe(true);
      expect(json.date.toString()).toBe(data.date.toString());
    });
    it('Should support `Map`', () => {
      const data = {
        map: new Map([
          [1, 'hello'],
          [2, 'world'],
          [3, '.'],
        ]),
      };
      const string = stringify(data);
      const json = parse(string);
      expect(json.map).not.toBe(data.map);
      expect(json.map instanceof Map).toBe(true);
      expect(JSON.stringify([...json.map])).toBe(JSON.stringify([...data.map]));
    });
  });
});
