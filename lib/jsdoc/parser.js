'use babel';

/* eslint-disable no-use-before-define */
const TYPE_PARSERS = {
  header: headerParser,
};
/* eslint-enable */


function headerParser(content) {
  const parts = content.replace('@header', '').split('-');
  const name = parts[0].trim();
  const res = { name };
  const description = parts[1] ? parts[1].trim() : null;
  if (description) {
    res.description = description;
  }
  return res;
}

function lineParser(oLines) {
  let result = {};
  const params = [];

  const lines = oLines.slice(0);
  lines[0] = `@header ${lines[0]}`;
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    ++i;

    if (!line.startsWith('@')) {
      throw new Error('Invalid JSDoc');
    }

    while(i < lines.length && !lines[i].startsWith('@')) {
      line += lines[i];
      ++i;
    }
    const type = line.split(' ')[0].replace('@', '');
    const typeParser = TYPE_PARSERS[type];
    const parseResult = typeParser(line);
    if (type === 'param') {
      params.push(parseResult);
    } else {
      result = Object.assign({}, result, parseResult);
    }
  }

  if (params.length) {
    result.params = params;
  }

  return result;
}

/**
 * getCleanLines - Takes a JSDoc and removes all the comment wrapper to leave
 * just nice cleans lines of data.
 *
 * @param {string} jsDoc JSDoc comment
 *
 * @return {array} List of lines from the JSDoc commnent.
 */
function getCleanLines(jsDoc) {
  return jsDoc.split('\n')
    .map(l => l.trim())
    .map(l => {
      const re = /\*\s+(.*)$/;
      const result = re.exec(l);
      return result ? result[1] : false;
    })
    .filter(Boolean);
}

/**
 * parse - Takes a JSDoc comment and returns an object representing it.
 *
 * @param {string} jsDoc Valid JSDoc comment
 *
 * @return {object} Object representing JSDoc structure
 */
export function parse(jsDoc) {
  const lines = getCleanLines(jsDoc);
  return lineParser(lines);
}
