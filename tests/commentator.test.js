import { comment } from '../lib/commentator';
import chai from 'chai';

chai.should();

describe('Commentator', () => {
  describe('comment', () => {
    it('should exist', () => {
      comment.should.be.a('function');
    });
  });
});
