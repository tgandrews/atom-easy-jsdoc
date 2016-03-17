import { parse } from '../lib/commentParser';
import chai from 'chai';

chai.should();

describe('Comment Parser', () => {
  describe('parse', () => {
    it('should continue a block comment start', () => {
      const line = '/** Here is my amazing comment';
      parse(line).should.equal(' *');
    });

    it('should continue a block comment', () => {
      const line = ' * and here is continues';
      parse(line).should.equal('*');
    });

    it('should continue a line comment', () => {
      const line = '// here is some comment';
      parse(line).should.equal('//');
    });

    it('should not continue after a block comment is ended', () => {
      const line = '*/';
      parse(line).should.equal('');
    });

    it('should not continue if a block comment closes and opens on the same line', () => {
      const line = '/** hello */';
      parse(line).should.equal('');
    });

    it('should not continue end of line comments', () => {
      const line = 'my javascript // my explanation';
      parse(line).should.equal('');
    });

    it('should not continue block comments if a star is in a line', () => {
      const line = 'var a = 2 * 4';
      parse(line).should.equal('');
    });

    it('should not continue block comments if start has other things on the line', () => {
      const line = 'var a = "/**"';
      parse(line).should.equal('');
    });

    it('should continue comments where that have been indented multiple times', () => {
      parse('\t\t* hello').should.equal('*');
      parse('\t\t/** hello').should.equal(' *');
      parse('\t\t// hello').should.equal('//');
    });
  });
});
