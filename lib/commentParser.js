'use babel';

const BLOCK_COMMENT_RE = /\s?\*(?!\/).*/i;
const BLOCK_COMMENT_START_RE = /\s?\/\*\*/i;
const BLOCK_COMMENT_END_RE = /.?\*\/\s?$/i;
const LINE_COMMENT_RE = /\s?\/\//i;

const BLOCK_COMMENT = '*';
const LINE_COMMENT = '//';

function getCommentStart(commentLine) {
  if (commentLine.match(BLOCK_COMMENT_END_RE)) {
    return '';
  }

  if (commentLine.match(BLOCK_COMMENT_START_RE)) {
    // Need to add extra indent from default line to line up with the second
    // star of a block comment line.
    return ` ${BLOCK_COMMENT}`;
  } else if (commentLine.match(BLOCK_COMMENT_RE)) {
    return BLOCK_COMMENT;
  } else if (commentLine.match(LINE_COMMENT_RE)) {
    return LINE_COMMENT;
  }

  return '';
}

export function parse(commentLine) {
  const commentStart = getCommentStart(commentLine);
  if (!commentStart) {
    return '';
  }

  return `${commentStart}`;
}
