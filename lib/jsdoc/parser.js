'use babel';


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
  const name = lines[0];
  return {
    name,
  };
}
