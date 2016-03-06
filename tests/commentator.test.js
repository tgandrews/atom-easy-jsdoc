import { comment } from '../lib/commentator';
import chai from 'chai';

chai.should();

describe('Commentator', () => {
  describe('comment', () => {
    it('should exist', () => {
      comment.should.be.a('function');
    });

    it('should be able to create a comment', () => {
      const code = `function helloWorld () {}`;
      const doc = `/**
* helloWorld - Description
*
* @returns {type} Description
**/`;

      const result = comment(code);
      result.should.equal(doc);
    });
  });
});
