import { render } from '../../../lib/jsdoc/renderer';
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

    it('should show the function description', () => {
      const structure = {
        name: 'helloWorld',
        description: 'It says hello',
        params: [],
      };
      const doc = `/**
 * helloWorld - It says hello
 *
 * @return {type} Description
 */`;

      render(structure).should.equal(doc);
    });

    it('should allow for different return keyword', () => {
      const structure = {
        name: 'helloWorld',
        returns: { returns: true },
      };

      const doc = `/**
 * helloWorld - Description
 *
 * @returns {type} Description
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

      it('should show default false values', () => {
        const structure = {
          name: 'helloWorld',
          params: [
            { name: 'a', defaultValue: false },
          ],
        };
        const doc = `/**
 * helloWorld - Description
 *
 * @param {type} [a=false] Description
 *
 * @return {type} Description
 */`;
        render(structure).should.equal(doc);
      });

      it('should show parent name', () => {
        const structure = {
          name: 'helloWorld',
          params: [
            { name: 'a', parent: 'p' },
          ],
        };
        const doc = `/**
 * helloWorld - Description
 *
 * @param {type} p.a Description
 *
 * @return {type} Description
 */`;
        render(structure).should.equal(doc);
      });
    });

    describe('location', () => {
      it('should be indented to the column depth in the location', () => {
        const structure = {
          name: 'helloWorld',
          params: [],
          location: {
            column: 4,
          },
        };
        const doc = `    /**
     * helloWorld - Description
     *
     * @return {type} Description
     */`;
        render(structure).should.equal(doc);
      });
    });
  });
});
