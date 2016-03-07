import { comment } from '../lib/commentator';
import chai from 'chai';

chai.should();

describe('Commentator', () => {
  describe('comment', () => {
    it('should exist', () => {
      comment.should.be.a('function');
    });

    it('should be able to create a comment without params', () => {
      const code = `function helloWorld () {}`;
      const doc = `/**
* helloWorld - Description
*
* @returns {type} Description
**/`;

      const result = comment(code);
      result.should.equal(doc);
    });

    it('should be able to create a comment with params', () => {
      const code = `function helloWorld (a, b, c) {}`;
      const doc = `/**
* helloWorld - Description
*
* @param a {type} Description
* @param b {type} Description
* @param c {type} Description
*
* @returns {type} Description
**/`;

      const result = comment(code);
      result.should.equal(doc);
    });
  });
});
