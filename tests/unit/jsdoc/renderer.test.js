import chai from 'chai';
import render from '../../../lib/jsdoc/renderer';

chai.should();

describe('JSDoc renderer', () => {
  describe('renderer', () => {
    it('should render the correct function name', () => {
      const structure = {
        name: 'helloWorld',
        type: 'function',
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
        type: 'function',
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
        type: 'function',
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
          type: 'function',
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
          type: 'function',
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
          type: 'function',
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
          type: 'function',
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
          type: 'function',
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
          type: 'function',
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

      it('should show default null values', () => {
        const structure = {
          name: 'helloWorld',
          params: [
            { name: 'a', defaultValue: null },
          ],
          type: 'function',
        };
        const doc = `/**
 * helloWorld - Description
 *
 * @param {type} [a=null] Description
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
          type: 'function',
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
          type: 'function',
        };
        const doc = `    /**
     * helloWorld - Description
     *
     * @return {type} Description
     */`;
        render(structure).should.equal(doc);
      });
    });

    describe('classes', () => {
      it('render the class declaration with name and default description', () => {
        const structure = {
          name: 'Foo',
          type: 'class',
        };

        const doc = `/**
 * Foo - Description
 */`;
        render(structure).should.equal(doc);
      });

      it('renders the class being extended from as an @extends parameter', () => {
        const structure = {
          name: 'Foo',
          extends: 'Bar',
          type: 'class',
        };

        const doc = `/**
 * Foo - Description
 * @extends Bar
 */`;
        render(structure).should.equal(doc);
      });

      it('renders class methods with their modifier keywords', () => {
        const structure = {
          name: 'helloStatic',
          type: 'classMethod',
          isStatic: true,
        };

        const doc = `/**
 * @static helloStatic - Description
 *
 * @return {type} Description
 */`;
        render(structure).should.equal(doc);
      });
    });
  });
});
