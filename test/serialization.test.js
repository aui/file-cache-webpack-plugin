/* eslint-disable no-shadow */
import Serialization from '../src/serialization';

const serialization = new Serialization();

describe('serialization data', () => {
  it('Should have the core functionality of `JSON.stringify`', () => {
    const data = {
      string: '',
      number: 1,
      null: null,
      object: { key: '' },
      array: [''],
      boolean: true,
    };
    expect(serialization.stringify(data)).toBe(JSON.stringify(data));
  });

  it('Should have the core functionality of `JSON.parse`', () => {
    const data = `{
      "string": "",
      "number": 1,
      "null": null,
      "object": { "key": "" },
      "array": [""],
      "boolean": true
    }`;
    const json = serialization.parse(data);
    Serialization.removeMetdata(json);
    Serialization.removeMetdata(json.object);
    expect(JSON.stringify(json)).toBe(JSON.stringify(JSON.parse(data)));
  });

  it('Unsupported types should be error', () => {
    const data = {
      function: () => {},
    };
    expect(() => serialization.stringify(data)).toThrowErrorMatchingSnapshot();
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
    const json = serialization.parse(serialization.stringify(data));
    expect(json.self.id).toBe(json.id);
    expect(json.child.parent.id).toBe(json.id);
    expect(json.child.self.id).toBe(json.child.id);
    expect(json.child.child.parent.id).toBe(json.child.id);
    expect(json.child.child.self.id).toBe(json.child.child.id);
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
    const whitelist = { RawSource };

    const data = {
      file: new RawSource('/hello.js', '🍪'),
    };
    const serialization = new Serialization(whitelist);
    const json = serialization.parse(serialization.stringify(data));
    expect(json.file instanceof RawSource).toBe(true);
    expect(json.file.path()).toBe(data.file.path());
    expect(json.file.source()).toBe(data.file.source());
  });

  describe('Support native class', () => {
    it('Should support `RegExp`', () => {
      const data = {
        regexp: /^\s+$/ig,
      };
      const string = serialization.stringify(data);
      const json = serialization.parse(string);
      expect(json.regexp).not.toBe(data.regexp);
      expect(json.regexp instanceof RegExp).toBe(true);
      expect(json.regexp.toString()).toBe(data.regexp.toString());
    });
    it('Should support `Date`', () => {
      const data = {
        date: new Date(),
      };
      const string = serialization.stringify(data);
      const json = serialization.parse(string);
      expect(json.date).not.toBe(data.date);
      expect(json.date instanceof Date).toBe(true);
      expect(json.date.toString()).toBe(data.date.toString());
    });
    // it('Should support `Map`', () => {
    //   const data = {
    //     map: new Map([
    //       [1, 'hello'],
    //       [2, 'world'],
    //       [3, '.'],
    //     ]),
    //   };
    //   const string = serialization.stringify(data);
    //   const json = serialization.parse(string);
    //   expect(json.map).not.toBe(data.map);
    //   expect(json.map instanceof Date).toBe(true);
    //   expect(json.map.toString()).toBe(data.map.toString());
    // });
  });
});
