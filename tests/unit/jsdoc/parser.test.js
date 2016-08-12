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

    it('should get the name', () => {
      const doc = `/**
 * helloWorld - Here is a description
 */`;
      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
      };
      parse(doc).should.eql(structure);
    });
  });
});
