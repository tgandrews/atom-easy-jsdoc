'use babel';

const BLOCK_COMMENT_RE = /^\s+\*[^\/]/i;
const BLOCK_COMMENT_START_RE = /^\s*\/\*\*.*$/i;
const BLOCK_COMMENT_END_RE = /.*\*\/\s?$/i;

const BLOCK_COMMENT = '* ';

/**
 * parse - Work out the type of comment on the line and return the appropriate
 * comment to continue.
 *
 * @param {String} commentLine Line to parse that may be a comment
 *
 * @returns {String} Necessary characters to continue the comment to found on
 * the line.
 */
export function parse(commentLine) {
  if (commentLine.match(BLOCK_COMMENT_END_RE)) {
    return '';
  }

  if (commentLine.match(BLOCK_COMMENT_START_RE)) {
    // Need to add extra indent from default line to line up with the second
    // star of a block comment line.
    return ` ${BLOCK_COMMENT}`;
  } else if (commentLine.match(BLOCK_COMMENT_RE)) {
    return BLOCK_COMMENT;
  }

  return '';
}
