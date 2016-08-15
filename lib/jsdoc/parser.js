'use babel';

/* eslint-disable no-use-before-define */
const TYPE_PARSERS = {
  header: headerParser,
  return: returnParser,
  returns: returnParser,
  param: paramParser,
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

/**
 * headerParser - Parse the first line of the JS Doc, the header.
 *
 * @param {string} content The header line
 *
 * @return {object} Object describing the JS Doc header.
 */
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

/**
 * returnParser - Parses return/returns keyword lines.
 *
 * @param {string} content The content describing the return properties
 *
 * @return {object} Object describing the return properties of the function
 */
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

/**
 * paramParser - Parses params
 *
 * @param {string} content Content to parse
 *
 * @return {object} Object describing the parameter.
 */
function paramParser(content) {
  const parts = content.split(/\s+/);
  const type = extractType(parts[1]);
  const name = parts[2];
  const description = parts.slice(3).join(' ');
  return {
    type,
    name,
    description,
  };
}

/**
 * lineParser - Parses each line to build up an object representing the JSDoc.
 *
 * @param {array} oLines Array of lines (string)
 *
 * @return {object} Object fully describing the JSDoc.
 */
function lineParser(oLines) {
  let result = {};
  const params = [];

  const lines = oLines.slice(0);
  lines[0] = `@header ${lines[0]}`;
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    ++i;

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
