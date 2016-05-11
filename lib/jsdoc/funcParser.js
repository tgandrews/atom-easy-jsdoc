import * as parser from 'babylon';
import traverse from 'babel-traverse';

const DEFAULT_PARAM_NAME = 'Unknown';
/* eslint-disable no-use-before-define */
const PARAM_PARSERS = {
  Identifier: parseIdentifierParam,
  AssignmentPattern: parseAssignmentParam,
  RestElement: parseRestParam,
  ObjectPattern: parseDestructuredParam,
};
/* eslint-enable */

function getAST(code) {
  const PARSE_OPTS = { locations: true, sourceType: 'module' };
  const ast = parser.parse(code, PARSE_OPTS);
  return ast;
}

function onLine(node, lineNum) {
  const startLine = node.loc.start.line;
  return startLine === lineNum || startLine - 1 === lineNum;
}

function getNode(ast, lineNum) {
  let node = null;
  traverse(ast, {
    FunctionDeclaration: (declaration) => {
      const n = declaration.node;
      if (onLine(n, lineNum)) {
        node = n;
      }
    },
  });
  return node;
}

function parseIdentifierParam(param) {
  return [{ name: param.name }];
}

function parseAssignmentParam(param) {
  let type;
  let defaultValue;

  const paramAssignmentType = param.right.type;

  if (paramAssignmentType === 'StringLiteral') {
    type = 'string';
    defaultValue = param.right.value;
  } else if (paramAssignmentType === 'NumericLiteral') {
    type = 'number';
    defaultValue = param.right.value;
  } else if (paramAssignmentType === 'ArrayExpression') {
    type = 'array';
    defaultValue = '[]';
  } else if (paramAssignmentType === 'ObjectExpression') {
    type = 'object';
    defaultValue = '{}';
  } else {
    throw('Unknown param type: ', paramAssignmentType);
  }

  return [{ name: param.left.name, defaultValue, type }];
}

function parseRestParam(param) {
  return [{ name: param.argument.name, type: 'array' }];
}

function parseDestructuredParam(param) {
  const props = param.properties;
  const parent = DEFAULT_PARAM_NAME;

  return props
    .reduce((params, { value }) => {
      const parser = PARAM_PARSERS[value.type];
      if (!parser) {
        throw new Error(`Unknown param type: ${value.type}`);
      }
      const newParams = parser(value).map((p) => Object.assign({}, p, { parent }));

      return params.concat(newParams);
    }, [{ name: parent, type: 'object' }]);
}

function simplifyParams(params) {
  return params.reduce((col, param) => {
    const parser = PARAM_PARSERS[param.type];
    if (!parser) {
      throw new Error(`Unknown param type: ${param.type}`);
    }
    return col.concat(parser(param));
  }, []);
}

function simplifyLocation(location) {
  return {
    line: location.start.line - 1,
    column: location.start.column,
  };
}

function simplifyNode(node) {
  return {
    name: node.id.name,
    location: simplifyLocation(node.loc),
    params: simplifyParams(node.params),
  };
}

export function parse(code, lineNum = 1) {
  const ast = getAST(code);
  const node = getNode(ast, lineNum);
  if (!node) {
    return null;
  }
  const simplified = simplifyNode(node);
  return simplified;
}
