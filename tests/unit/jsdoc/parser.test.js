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

    it('should get the description', () => {
      const doc = `/**
 * helloWorld - Here is a description
 */`;
      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
      };
      parse(doc).should.eql(structure);
    });

    it('should extract the return property', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @return {type} Description
 */`;

      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
        returns: {
          returns: false,
          type: 'type',
          description: 'Description',
        },
      };

      parse(doc).should.eql(structure);
    });

    it('should extract the return property', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @returns {type} Description
 */`;

      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
        returns: {
          returns: true,
          type: 'type',
          description: 'Description',
        },
      };

      parse(doc).should.eql(structure);
    });

    it('should extract a parameter', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @param {string} a A does a thing
 *
 * @returns {type} Description
 */`;
      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
        params: [{
          type: 'string',
          name: 'a',
          description: 'A does a thing',
        }],
        returns: {
          returns: true,
          type: 'type',
          description: 'Description',
        },
      };

      parse(doc).should.eql(structure);
    });

    it('should extract multiple parameters', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @param {string} a A does a thing
 * @param {object} b B does something else
 *
 * @returns {type} Description
 */`;
      const structure = {
        name: 'helloWorld',
        description: 'Here is a description',
        params: [{
          type: 'string',
          name: 'a',
          description: 'A does a thing',
        }, {
          type: 'object',
          name: 'b',
          description: 'B does something else',
        }],
        returns: {
          returns: true,
          type: 'type',
          description: 'Description',
        },
      };

      parse(doc).should.eql(structure);
    });
  });
});
