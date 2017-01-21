import { parse } from '../../../lib/jsdoc/funcParser';
import chai from 'chai';

chai.should();

describe('Func parser', () => {
  describe('parsing', () => {
    it('should return the function name', () => {
      const code = 'function helloWorld () {}';
      parse(code).name.should.equal('helloWorld');
    });

    it('should get the function for the line specified', () => {
      const code = `function helloWorld() {}

function myWorld() {}

function anotherWorld() {}`;
      parse(code, 3).name.should.equal('myWorld');
    });

    it('should get the function for the line below the line number specified', () => {
      const code = `function helloWorld() {}

function myWorld() {}

function anotherWorld() {}`;
      parse(code, 2).name.should.equal('myWorld');
    });

    it('should return null when there is no function found', () => {
      const code = `function helloWorld() {}

function myWorld() {}

function anotherWorld() {}`;
      (parse(code, 999) === null).should.equal(true);
    });

    it('should get the name from variable declarations - var', () => {
      const code = 'var helloWord = function () {};';
      parse(code).name.should.equal('helloWord');
    });

    it('should get the name from variable declarations - let', () => {
      const code = 'let helloWord = function () {};';
      parse(code).name.should.equal('helloWord');
    });

    it('should get the name from the variable declartion - let arrow', () => {
      const code = 'let helloWorld = () => {};';
      parse(code).name.should.equal('helloWorld');
    });

    it('should get the name from variable declarations - const', () => {
      const code = 'const helloWord = function () {};';
      parse(code).name.should.equal('helloWord');
    });

    it('should get the name from the variable declartion - const arrow', () => {
      const code = 'const helloWorld = () => {};';
      parse(code).name.should.equal('helloWorld');
    });

    it('should get the function name from the property name being assigned to', () => {
      const code = 'this.helloWorld = function () {}';
      parse(code).name.should.equal('helloWorld');
    });

    it('should get the name when there is a space or not', () => {
      const code = 'this.helloWorld = function(){}';
      parse(code).name.should.equal('helloWorld');
    });

    it('should set a returns property', () => {
      const code = 'function helloWorld() {}';
      parse(code).returns.should.deep.equal({ returns: false });
    });

    it('should ignore #! lines used in scripts', () => {
      const code = `#!/bin/env node

function bob(){}`;
      parse(code, 3).name.should.equal('bob');
    });

    it('should be able to parse function expressions in objects', () => {
      const code = `const obj = {
        foo(arg) {
          return arg;
        }
      };`;
      parse(code, 2).name.should.equal('foo');
    });

    describe('location', () => {
      it('should be start of the function', () => {
        const code = '    function helloWorld() {}';
        parse(code).location.column.should.equal(4);
      });

      it('should be start of export keyword for exported functions', () => {
        const code = '  export function hello() {}';
        parse(code).location.column.should.equal(2);
      });

      it('should be start of export keyword for exported default functions', () => {
        const code = '   export default function hello() {}';
        parse(code).location.column.should.equal(3);
      });

      it('should be start of async keyword for async functions', () => {
        const code = '  async function hello() {}';
        parse(code).location.column.should.equal(2);
      });

      it('should be start of export keyword for exported async functions', () => {
        const code = '  export async function hello() {}';
        parse(code).location.column.should.equal(2);
      });

      it('should be above the function location', () => {
        const code = `
function a() {}

function b() {}`;
        parse(code, 2).location.line.should.equal(1);
      });

      it('should be the line of the function if the function is on the first line', () => {
        const code = 'function b() {}';
        parse(code).location.line.should.equal(1);
      });
    });

    describe('parameters', () => {
      it('should return the parameters', () => {
        const code = 'function helloWorld(a) {}';
        parse(code).params.should.contain({ name: 'a' });
      });

      it('should return all the parameters in the correct order', () => {
        const code = 'function helloWorld(a, b, c, bobblyboo, d) {}';
        const params = parse(code).params;
        const expected = [
          { name: 'a' }, { name: 'b' }, { name: 'c' },
          { name: 'bobblyboo' }, { name: 'd' },
        ];
        for (let i = 0; i < expected.length; ++i) {
          params[i].name.should.equal(expected[i].name);
        }
      });

      it('should set the correct type for the default value - Number', () => {
        const code = 'function helloWorld(a = 1) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'a', defaultValue: 1, type: 'number' });
      });

      it('should set the correct type for the default value - String', () => {
        const code = "function helloWorld(b = 'default') {}";
        const params = parse(code).params;
        params.should.contain({ name: 'b', defaultValue: 'default', type: 'string' });
      });

      it('should set the correct type for the deafult value - Boolean', () => {
        const code = 'function helloWorld(b = false) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'b', defaultValue: false, type: 'boolean' });
      });

      it('should set the correct type for the default value - Object', () => {
        const code = 'function helloWorld(c = {}) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'c', defaultValue: '{}', type: 'object' });
      });

      it('should set the correct type for the default value - Array', () => {
        const code = 'function helloWorld(d = []) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'd', defaultValue: '[]', type: 'array' });
      });

      it('should set the correct type for the default value - Array', () => {
        const code = 'function helloWorld(d = null) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'd', defaultValue: null, type: 'null' });
      });

      it('should support rest parameters setting the type as array', () => {
        const code = 'function helloWorld(...stuff) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'stuff', type: 'array' });
      });

      it('should support destructured parameters', () => {
        const code = 'function helloWorld({ a, b }) {}';
        const params = parse(code).params;
        params.should.contain({ name: 'Unknown', type: 'object' });
        params.should.contain({ name: 'a', parent: 'Unknown' });
        params.should.contain({ name: 'b', parent: 'Unknown' });
      });

      it('should support destructured parameters with default values', () => {
        const code = "function helloWorld({ a = 1, b = 'hello' }) {}";
        const params = parse(code).params;
        params.should.contain({ name: 'a', parent: 'Unknown', defaultValue: 1, type: 'number' });
        params.should.contain({
          name: 'b', parent: 'Unknown', defaultValue: 'hello', type: 'string',
        });
      });
    });

    describe('classes', () => {
      it('should set type to be class when on class definition', () => {
        const code = `class Foo {
          constructor() {}
        }`;
        parse(code, 1).type.should.equal('class');
      });

      it('should set extended property to be class that was extended', () => {
        const code = `class Foo extends Bar {
          constructor() {}
        }`;
        parse(code, 1).extends.should.equal('Bar');
      });

      it('should create a normal function defintion for class methods', () => {
        const code = `class Foo extends Bar {
          constructor() {}
        }`;
        parse(code, 2).name.should.equal('constructor');
      });

      it('should not barf at class properties', () => {
        const code = `class Foo {
          static props = {}
        }`;
        parse(code, 2);
      });
    });

    describe('future/non-standard JS features', () => {
      it('object rest spread', () => {
        const code = 'const foo = ({ a, ...rest }) => ({ a, ...rest });';
        const result = parse(code, 1);
        result.name.should.equal('foo');
        result.params.should.contain({ name: 'rest', parent: 'Unknown', type: 'array' });
      });

      it('flow', () => {
        const code = `
        // @flow
        function bar(x): string {
          return x.length;
        }
        bar('Hello, world!');`;
        parse(code, 2).name.should.equal('bar');
      });

      it('jsx', () => {
        const code = 'const title = ({ name }) => <h1>{name}</h1>';
        parse(code, 1).name.should.equal('title');
      });
    });

    describe('errors', () => {
      it('should throw a reasonable error when there is invalid JavaScript', () => {
        const code = 'afoahfa afohafo^^h$"a aflajfl';
        try {
          parse(code);
        } catch (e) {
          e.message.should.match(/atom-easy-jsdoc expects valid JavaScript. Error parsing: .*/);
        }
      });
    });
  });
});
