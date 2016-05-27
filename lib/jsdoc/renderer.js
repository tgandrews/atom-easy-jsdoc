'use babel';

/* eslint-disable no-use-before-define, quote-props */
const CONTENT_BUILDERS = {
  'function': renderFuncContent,
  'class': renderClassContent,
};
/* eslint-enable */
const OPEN = '/**';
const SPACER = ' *';
const CLOSE = ' */';
const LINE_PADDER = ' ';


/**
 * padString - Increase length of string to the defined length padding the right
 * side.
 *
 * @param {String} str    String to pad
 * @param {Number} length Length to increase it to
 *
 * @return {String} String padded to the correct length
 */
function padString(str, length) {
  const padding = ' '.repeat(length - str.length);
  return `${str}${padding}`;
}

/**
 * renderParam - Render a function parameter as a param property.
 *
 * @param {Number} nameLength     Max name length of the parameters
 * @param {Number} typeLength     Max type length of the parameters
 * @param {Object} Parameter      Object representing the parameters
 * @param {String} Parameter.name Name of the parameter
 * @param {String} Parameter.type Type of the parameter
 *
 * @return {type} Description
 */
function renderParam(nameLength, typeLength, { name, type }) {
  const paddedName = padString(name, nameLength);
  const paddedType = padString(`${type}`, typeLength);
  return ` * @param ${paddedType} ${paddedName} Description`;
}

/**
 * sortNum - Comparison of numbers for sorting.
 *
 * @param {int} a First number
 * @param {int} b Second number
 *
 * @returns {int} A negative value if a less than b, a positive if b is less
 * than a and 0 if they are the same.
 */
function sortNum(a, b) {
  return a - b;
}

/**
 * maxPropertyLength - Get the max length of a property from a list of objects.
 *
 * @param {Array}  arr      List of objects
 * @param {String} propName Property name in each of the objects
 *
 * @return {Number} Max length of the property in the array of objects.
 */
function maxPropertyLength(arr, propName) {
  return arr
    .map(obj => (obj[propName] || '').length)
    .sort(sortNum)
    .reverse()[0];
}

/**
 * jsdocifyParams - Simplify the param object structure. JS Doc uses param name
 * to hold default value and parent values.
 *
 * @param {Array} params List of parameters
 *
 * @return {Array} Simple parameter objects with name and type.
 */
function jsdocifyParams(params) {
  return params.map(({ type = 'type', name, defaultValue, parent }) => {
    let tidiedName = name;
    if (parent) {
      tidiedName = `${parent}.${tidiedName}`;
    }
    if (typeof defaultValue !== 'undefined') {
      tidiedName = `[${tidiedName}=${defaultValue}]`;
    }

    return {
      type: `{${type}}`,
      name: tidiedName,
    };
  });
}

/**
 * renderParams - Render the params array as JS Doc params
 *
 * @param {Array} funcParams List of function parameters
 *
 * @return {Array} List of string lines representing function parameters
 */
function renderParams(funcParams) {
  const jsdocParams = jsdocifyParams(funcParams);

  const maxNameLength = maxPropertyLength(jsdocParams, 'name');
  const maxTypeLength = maxPropertyLength(jsdocParams, 'type');

  return jsdocParams.map(renderParam.bind(null, maxNameLength, maxTypeLength));
}

/**
 * renderFuncContent - Take the JS Doc description and extract the function
 * specific properties to add to the JS Doc.
 *
 * @param {object} structure              Object describing the JS Doc
 * @param {array}  [structure.params=[]]  The function parameters
 * @param {object} [structure.returns={}] The function return properties
 *
 * @return {array} List of lines to make up the function content of the JS Doc.
 */
function renderFuncContent({ params = [], returns = {} }) {
  const content = [];
  content.push(SPACER);

  const renderedParams = renderParams(params);
  for (let i = 0; i < renderedParams.length; i++) {
    content.push(renderedParams[i]);
  }
  if (renderedParams.length > 0) {
    content.push(SPACER);
  }
  const returnKeyword = returns.returns ? 'returns' : 'return';
  const returnLine = ` * @${returnKeyword} {type} Description`;

  content.push(returnLine);
  return content;
}

/**
 * renderClassContent - Take the JS Doc description and extract the class
 * specific properties to add to the JS Doc.
 *
 * @param {object} structure Object describing the JS Doc
 *
 * @return {array} List of lines to make up the class content of the JS Doc.
 */
function renderClassContent(structure) {
  const content = [];

  const ext = structure.extends;
  if (ext) {
    content.push(` * @extends ${ext}`);
  }
  return content;
}

/**
 * render - Take a structure describing a function and render the JS Doc to
 * represent it.
 *
 * @param {Object} structure Complete structure
 *
 * @return {String} JS Doc comment
 */
export function render(structure) {
  const { name, description = 'Description', type, location = {} } = structure;

  const nameLine = ` * ${name} - ${description}`;
  const header = [OPEN];
  const footer = [CLOSE];

  const contentBuilder = CONTENT_BUILDERS[type];
  if (!contentBuilder) {
    throw new Error(`Unknown JS Doc type: ${type}`);
  }
  const content = [nameLine].concat(contentBuilder(structure));

  const lines = header.concat(content).concat(footer);

  const { column = 0 } = location;
  const indentation = LINE_PADDER.repeat(column);

  return lines.map((line) => `${indentation}${line}`).join('\n');
}
