'use babel';

/* eslint-disable no-use-before-define */
const TYPE_PARSERS = {
  header: headerParser,
  return: returnParser,
};
/* eslint-enable */


/**
 * extractType - Unwrap a JSDoc type description
 *
 * @param {string} wrappedType Wrapped JSDoc type e.g. {object}
 *
 * @return {string} Return an unwrapped JSDoc type e.g. object
 */
function extractType(wrappedType) {
  return wrappedType.substring(1, wrappedType.length - 1);
}

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

function returnParser(content) {
  const parts = content.split(/\s+/);
  const returnsKey = parts[0];
  const returns = returnsKey.endsWith('s');
  const type = extractType(parts[1]);
  const description = parts.slice(2).join(' ');
  return {
    returns: {
      returns,
      type,
      description,
    },
  };
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
    if (!typeParser) {
      throw new Error(`Unknown doc type: ${type}`);
    }

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
    .map(l => {
      const re = /\*\s+(.*)$/;
      const result = re.exec(l.trim());
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
