import { parse } from '../../../lib/jsdoc/parser.js';
import chai from 'chai';

chai.should();

describe('JSDoc Paser', () => {
  describe('parser', () => {
    it('should get the name', () => {
      const doc = `/**
 * helloWorld
 */`;

      parse(doc).name.should.eql('helloWorld');
    });

    it('should get the description', () => {
      const doc = `/**
 * helloWorld - Here is a description
 */`;
      parse(doc).description.should.eql('Here is a description');
    });

    it('should extract the return property', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @return {type} Description
 */`;

      const returns = {
        returns: false,
        type: 'type',
        description: 'Description',
      };

      parse(doc).returns.should.eql(returns);
    });

    it('should extract the return property', () => {
      const doc = `/**
 * helloWorld - Here is a description
 *
 * @returns {type} Description
 */`;

      const returns = {
        returns: true,
        type: 'type',
        description: 'Description',
      };

      parse(doc).returns.should.eql(returns);
    });


    describe('parameters', () => {
      it('should extract a parameter', () => {
        const doc = `/**
   * helloWorld - Here is a description
   *
   * @param {string} a A does a thing
   *
   * @returns {type} Description
   */`;
        const params = [{
          type: 'string',
          name: 'a',
          description: 'A does a thing',
        }];

        parse(doc).params.should.eql(params);
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
        const params = [{
          type: 'string',
          name: 'a',
          description: 'A does a thing',
        }, {
          type: 'object',
          name: 'b',
          description: 'B does something else',
        }];

        parse(doc).params.should.eql(params);
      });

      it('should extract parameters with a parent', () => {
        const doc = `/**
   * helloWorld - Here is a description
   *
   * @param {string} b.a A does a thing
   *
   * @returns {type} Description
   */`;
        const params = [{
          type: 'string',
          name: 'a',
          parent: 'b',
          description: 'A does a thing',
        }];

        parse(doc).params.should.eql(params);
      });

      it('should extract default values', () => {
        const doc = `/**
   * helloWorld - Here is a description
   *
   * @param {number} [a=1] A does a thing
   *
   * @returns {type} Description
   */`;

        const params = [
          { name: 'a', defaultValue: '1', type: 'number', description: 'A does a thing' },
        ];
        parse(doc).params.should.eql(params);
      });
    });
  });
});
