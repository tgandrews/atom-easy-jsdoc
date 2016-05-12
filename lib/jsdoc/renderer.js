'use babel';

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
  const spacer = ' ';
  const padding = spacer.repeat(length - str.length);
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
    if (defaultValue) {
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
 * render - Take a structure describing a function and render the JS Doc to
 * represent it.
 *
 * @param {Object} Structure                           Complete structure
 * @param {String} Structure.name                      Function name
 * @param {String} [Structure.description=Description] Function description
 * @param {Array}  [Structure.params=Array]            Array of params objects
 * @param {Object} [Structure.returns=Object]          Definition of returns
 *
 * @return {String} JS Doc comment
 */
export function render({ name, description = 'Description', params = [], returns = {} }) {
  const open = '/**';
  const spacer = ' *';
  const nameLine = ` * ${name} - ${description}`;
  const returnKeyword = returns.returns ? 'returns' : 'return';
  const returnLine = ` * @${returnKeyword} {type} Description`;
  const close = ' */';

  const header = [open, nameLine, spacer];
  const footer = [returnLine, close];

  const renderedParams = renderParams(params);
  if (renderedParams.length > 0) {
    renderedParams.push(spacer);
  }

  return header.concat(renderedParams).concat(footer).join('\n');
}
