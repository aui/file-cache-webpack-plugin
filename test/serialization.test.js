import Serialization from '../src/serialization';

describe('serialization data', () => {
  it('Should have the core functionality of "JSON.stringify"', () => {
    const data = {
      string: '',
      number: 1,
      null: null,
      object: { key: '' },
      array: [''],
      boolean: true,
    };
    const serialization = new Serialization();
    expect(serialization.stringify(data)).toBe(JSON.stringify(data));
  });

  it('Should have the core functionality of "JSON.parse"', () => {
    const data = `{
      "string": "",
      "number": 1,
      "null": null,
      "object": { "key": "" },
      "array": [""],
      "boolean": true,
    }`;
    const serialization = new Serialization();
    expect(serialization.parse(data)).toBe(JSON.parse(data));
  });

  // it('serialization regexp', () => {
  //   const input = {
  //     regexp: /\s+/,
  //   };
  //   const string = JSON.stringify(input, encode);
  //   const json = JSON.parse(string, decode);
  //   expect(json.regexp).not.toBe(input.regexp);
  //   expect(json.regexp instanceof RegExp).toBe(true);
  //   expect(json.regexp.toString()).toBe(input.regexp.toString());
  // });

  // it('function operation failure should report critical information.', () => {
  //   const a = 0;
  //   const b = 1;
  //   const input = {
  //     func: () => a + b,
  //   };
  //   const string = JSON.stringify(input, encode);
  //   expect(() => (JSON.parse(string, decode)).func()).toThrow('the option "func" performs an error in the child process:');
  // });
});
