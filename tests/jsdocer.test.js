import { comment } from '../lib/jsdocer';
import chai from 'chai';

chai.should();

describe('Commentator', () => {
  describe('comment', () => {
    it('should be able to create a comment without params', () => {
      const code = 'function helloWorld () {}';
      const doc = `/**
 * helloWorld - Description
 *
 * @returns {type} Description
 */`;

      comment(code).content.should.equal(doc);
    });

    it('should be able to create a comment with params', () => {
      const code = 'function helloWorld (a, b, c) {}';
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 * @param {type} c Description
 *
 * @returns {type} Description
 */`;

      comment(code).content.should.equal(doc);
    });

    it('should line up parameter descriptions', () => {
      const code = 'function helloWorld(a, longParam, c) {}';
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a         Description
 * @param {type} longParam Description
 * @param {type} c         Description
 *
 * @returns {type} Description
 */`;

      comment(code).content.should.equal(doc);
    });

    it('should create a comment when on the line of the function', () => {
      const code = `
function somethingElse(d, e) {}

function helloWorld(a, b, c) {}
`;
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 * @param {type} c Description
 *
 * @returns {type} Description
 */`;

      comment(code, 4).content.should.equal(doc);
    });

    it('should create a comment when on the line above a function', () => {
      const code = `
function somethingElse(d, e) {}

function helloWorld(a, b, c) {}
`;
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 * @param {type} c Description
 *
 * @returns {type} Description
 */`;

      comment(code, 3).content.should.equal(doc);
    });
  });

  describe('comment location', () => {
    it('above the line of the func', () => {
      const code = `
function somethingElse(d, e) {}

function helloWorld(a, b, c) {}
`;
      comment(code, 3).line.should.equal(3);
    });

    it('with the same indentation as the function', () => {
      const code = '      function helloWorld(a, b, c) {}';
      const doc = `      /**
       * helloWorld - Description
       *
       * @param {type} a Description
       * @param {type} b Description
       * @param {type} c Description
       *
       * @returns {type} Description
       */`;
      comment(code).content.should.equal(doc);
    });
  });

  describe('ES2015 functions', () => {
    it('supports export', () => {
      const code = 'export function helloWorld(a, b, c) {}';
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 * @param {type} c Description
 *
 * @returns {type} Description
 */`;

      comment(code).content.should.equal(doc);
    });

    it('supports default export', () => {
      const code = 'export default function helloWorld(a, b, c) {}';
      const doc = `/**
 * helloWorld - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 * @param {type} c Description
 *
 * @returns {type} Description
 */`;

      comment(code).content.should.equal(doc);
    });
  });
});
