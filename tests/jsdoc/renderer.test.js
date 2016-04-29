import { render } from '../../lib/jsdoc/renderer';
import chai from 'chai';

chai.should();

describe('JSDoc renderer', () => {
  describe('renderer', () => {
    it('should render the correct function name', () => {
      const structure = {
        name: 'helloWorld',
      };
      const doc = `/**
 * helloWorld - Description
 *
 * @return {type} Description
 */`;

      render(structure).should.equal(doc);
    });

    describe('params', () => {
      it('should render basic parameter', () => {
        const structure = {
          name: 'helloWorld',
          params: [{ name: 'a' }],
        };
        const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 *
 * @return {type} Description
 */`;
        render(structure).should.equal(doc);
      });
    });

    it('should render the parameter type of Object', () => {
      const structure = {
        name: 'helloWorld',
        params: [{ name: 'a', type: 'Object' }],
      };
      const doc = `/**
 * helloWorld - Description
 *
 * @param {Object} a Description
 *
 * @return {type} Description
 */`;
      render(structure).should.equal(doc);
    });

    it('should render the parameter type of Array', () => {
      const structure = {
        name: 'helloWorld',
        params: [{ name: 'a', type: 'Array' }],
      };
      const doc = `/**
 * helloWorld - Description
 *
 * @param {Array} a Description
 *
 * @return {type} Description
 */`;
      render(structure).should.equal(doc);
    });

    it('should align types and names of parameters', () => {
      const structure = {
        name: 'helloWorld',
        params: [
          { name: 'a', type: 'verylongtype' },
          { name: 'verylongname', type: 'short' },
        ],
      };
      const doc = `/**
 * helloWorld - Description
 *
 * @param {verylongtype} a            Description
 * @param {short}        verylongname Description
 *
 * @return {type} Description
 */`;
      render(structure).should.equal(doc);
    });

    it('should show default values', () => {
      const structure = {
        name: 'helloWorld',
        params: [
          { name: 'a', defaultValue: 'bob' },
        ],
      };
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} [a=bob] Description
 *
 * @return {type} Description
 */`;
      render(structure).should.equal(doc);
    });
  });
});
