import { parse } from '../lib/commentParser';
import chai from 'chai';

chai.should();

describe('Comment Parser', () => {
  describe('parse', () => {
    it('should exist', () => {
      parse.should.be.a('function');
    });

    it('should continue a block comment start', () => {
      const comment = '/** Here is my amazing comment';
      parse(comment).should.equal(' *');
    });

    it('should continue a block comment', () => {
      const comment = ' * and here is continues';
      parse(comment).should.equal(' *');
    });

    it('should continue a line comment', () => {
      const comment = '// here is some comment';
      parse(comment).should.equal('//');
    });

    it('should maintain indentation', () => {
      const comment = '  // here is an indented comment';
      parse(comment).should.equal('  //');
    });
  });
});
