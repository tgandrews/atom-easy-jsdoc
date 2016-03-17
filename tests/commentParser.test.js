import { parse } from '../lib/commentParser';
import chai from 'chai';

chai.should();

describe('Comment Parser', () => {
  describe('parse', () => {
    it('should continue a block comment start', () => {
      const comment = '/** Here is my amazing comment';
      parse(comment).should.equal(' *');
    });

    it('should continue a block comment', () => {
      const comment = ' * and here is continues';
      parse(comment).should.equal('*');
    });

    it('should continue a line comment', () => {
      const comment = '// here is some comment';
      parse(comment).should.equal('//');
    });

    it('should not continue after a block comment is ended', () => {
      const comment = '*/';
      parse(comment).should.equal('');
    });

    it('should not continue if a block comment closes and opens on the same line', () => {
      const comment = '/** hello */';
      parse(comment).should.equal('');
    });
  });
});
