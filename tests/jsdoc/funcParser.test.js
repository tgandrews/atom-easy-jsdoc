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
  });
});
