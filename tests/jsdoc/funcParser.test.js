import { parse } from '../../lib/jsdoc/funcParser';
import chai from 'chai';

chai.should();

describe('Func parser', () => {
  describe('parsing', () => {
    it('should return the function name', () => {
      const code = 'function helloWorld () {}';
      parse(code).name.should.equal('helloWorld');
    });

    it('should return the location', () => {
      const code = 'function helloWorld() {}';
      parse(code).location.should.deep.equal({ line: 0, column: 0 });
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
        params.should.contain({ name: 'b', parent: 'Unknown', defaultValue: 'hello', type: 'string' });
      });
    });
  });
});
