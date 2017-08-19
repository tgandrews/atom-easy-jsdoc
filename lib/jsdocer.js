'use babel';

import parse from './jsdoc/funcParser';
import render from './jsdoc/renderer';

/**
 * comment - Return JS Doc or empty string for the comment on the node at or
 * one line above the line provided.
 *
 * @param {String} code     Code containing the function.
 * @param {int} [lineNum=1] Line number containing the
 * @param {boolean} [useReturns=false] Use returns style of JSDoc comment
 *
 * @returns {Object|String} Object containing the comment or an empty string.
 */
export default function comment(code, lineNum = 1, useReturns = false) {
  const desc = parse(code, lineNum);
  if (!desc) {
    return '';
  }
  if (desc.returns) {
    desc.returns = Object.assign(desc.returns, { returns: useReturns });
  }
  const content = render(desc);
  const line = desc.location.line;
  return { content, line };
}
