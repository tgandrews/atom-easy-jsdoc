'use babel';

import * as acorn from 'acorn';
import * as walker from 'acorn/dist/walk';

const DEFAULT_PARAM_TYPE = 'type';
const DEFAULT_PARAM_NAME = 'Unknown';

/**
 * padString - Pads the end of the string with spaces to the given length.
 *
 * @param {string} str - String to pad
 * @param {int} length - Length to pad the string to
 *
 * @returns {string} String padded to the correct length.
 */
function padString(str, length) {
  return `${str}${' '.repeat(length - str.length)}`;
}

/**
 * parseIdentifierParam - Parse identifier params ast node i.e. simplest param
 * types with no default value.
 *
 * @param {Object} param AST identifier param node
 *
 * @returns {Array} Array of param objects with name and type
 */
function parseIdentifierParam(param) {
  return [{ name: param.name, type: DEFAULT_PARAM_TYPE }];
}

/**
 * parseDefaultParam - Parse default param AST node and convert it to param
 * objects.
 *
 * @param {Object} param AST indentifier param node.
 *
 * @returns {Array} Array of param objects with name and type
 */
function parseDefaultParam(param) {
  return [{ name: `[${param.left.name}=${param.right.value}]`, type: DEFAULT_PARAM_TYPE }];
}

/**
 * parseDestructuredParam - Parse destructured params AST node into param
 * objects
 *
 * @param {Object} param AST identifier of destructured param node.
 *
 * @returns {Array} Array of param objects with name and type
 */
function parseDestructuredParam(param) {
  const params = [{ name: DEFAULT_PARAM_NAME, type: 'Object' }];
  const props = param.properties;
  for (let i = 0; i < props.length; ++i) {
    const prop = props[i];
    params.push({ name: `${DEFAULT_PARAM_NAME}.${prop.key.name}`, type: DEFAULT_PARAM_TYPE });
  }
  return params;
}

/**
 * parseRestParam - Convert rest params AST node to array of param objects.
 *
 * @param {Object} param AST param node representing a rest parameter.
 *
 * @returns {Array} Array of param objects with name and type
 */
function parseRestParam(param) {
  return [{ name: param.argument.name, type: 'Array' }];
}

/**
 * makeParams - Create list of JS Doc params from the function node parameters
 *
 * @param {Array} params Array of function node parameters as AST repreentation
 *
 * @returns {Array} Array of strings representing JS Doc parameter lines from
 * the parameters provided.
 */
function makeParams(params) {
  const cleanParams = params
    .reduce((col, param) => {
      if (param.type === 'Identifier') {
        return col.concat(parseIdentifierParam(param));
      } else if (param.type === 'AssignmentPattern') {
        return col.concat(parseDefaultParam(param));
      } else if (param.type === 'ObjectPattern') {
        return col.concat(parseDestructuredParam(param));
      } else if (param.type === 'RestElement') {
        return col.concat(parseRestParam(param));
      }
      throw new Error(`Unknown param type:\n${JSON.stringify(param, null, 2)}`);
    }, []);

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

  const maxNameLength = cleanParams.map(({ name }) => name.length).sort(sortNum).reverse()[0];
  const maxTypeLength = cleanParams.map(({ type }) => type.length + 2).sort(sortNum).reverse()[0];

  return cleanParams
    .map(({ name, type }) => {
      const paddedType = padString(`{${type}}`, maxTypeLength);
      const paddedName = padString(name, maxNameLength);
      return ` * @param ${paddedType} ${paddedName} Description`;
    });
}

/**
 * getIndent - Get the amount a JS Doc comment should be indentend. We cannot
 * take that from the function as it is quite common for `export function`.
 * We want to align with the export, not the function in this case.
 *
 * @param {Object} node AST node representing the function.
 *
 * @returns {int} Number of columns that the JS Doc comment should be indented.
 */
function getIndent(node) {
  return (node.exported) ? node.exportedStart : node.loc.start.column;
}

/**
 * buildContent - Takes a function node and returns a representative JS Doc
 * comment.
 *
 * @param {Object} node AST repreentation of function node
 * @param {boolean} useReturns Use returns instead of return
 *
 * @returns {String} JS Doc comment representing the function node.
 */
function buildContent(node, useReturns) {
  const params = makeParams(node.params);
  const indent = getIndent(node);
  const returnKey = useReturns ? 'returns' : 'return';
  if (params.length > 0) {
    params.push(' *');
  }
  const title = [
    '/**',
    ` * ${node.id.name} - Description`,
    ' *',
  ];
  const returns = [
    ` * @${returnKey} {type} Description`,
    ' */',
  ];

  return title
    .concat(params)
    .concat(returns)
    .map((line) => ' '.repeat(indent) + line)
    .join('\n');
}

/**
 * buildResult - Build a result object from node, including JS Doc and line to
 * insert the comment at.
 *
 * @param {Object} node AST node representing the function being commented.
 * @param {boolean} useReturns When enabled uses the returns return type
 *
 * @returns {Object} Containing content (JS Doc comment) and line to insert the
 * comment.
 */
function buildResult(node, useReturns) {
  const content = buildContent(node, useReturns);
  const line = node.loc.start.line - 1;
  return {
    content,
    line,
  };
}

/**
 * getNode - Find the function at (or one line below) the line number provided
 * in the code.
 *
 * @param {String} code - Code containing the function to be commented.
 * @param {int} lineNum - Line number containing the function.
 *
 * @returns {Object} AST representation of the function at the line or null if
 * no function is found.
 */
function getNode(code, lineNum) {
  const ACORN_OPTS = { locations: true, sourceType: 'module' };
  const ast = acorn.parse(code, ACORN_OPTS);
  let node = null;

  /**
   * exportNode - Add the exported details to the function node if it was
   * exported. We can tell it was exported if the end of the export and the
   * function are the same.
   *
   * @param {Object} n Export node as repesented by the AST.
   *
   * @returns {void}
   */
  function exportNode(n) {
    if (node.end === n.end) {
      node.exported = true;
      node.exportedStart = n.loc.start.column;
    }
  }
  walker.simple(ast, {
    FunctionDeclaration: (n) => {
      const funcLine = n.loc.start.line;
      if (funcLine === lineNum || funcLine === (lineNum + 1)) {
        node = n;
      }
    },
    ExportNamedDeclaration: exportNode,
    ExportDefaultDeclaration: exportNode,
  });
  return node;
}

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
export function comment(code, lineNum = 1, useReturns = false) {
  const node = getNode(code, lineNum);
  if (node) {
    return buildResult(node, useReturns);
  }
  return '';
}
