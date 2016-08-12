import { parse } from '../../../lib/jsdoc/parser.js';
import chai from 'chai';

chai.should();

describe('JSDoc Paser', () => {
  describe('parser', () => {
    it('should get the name', () => {
      const doc = `/**
 * helloWorld
 */`;
      const structure = {
        name: 'helloWorld',
      };
      parse(doc).should.eql(structure);
    });
  });
});
