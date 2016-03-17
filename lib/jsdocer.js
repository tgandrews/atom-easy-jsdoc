'use babel';

import * as acorn from 'acorn';
import * as walker from 'acorn/dist/walk';

const DEFAULT_PARAM_TYPE = 'type';
const DEFAULT_PARAM_NAME = 'Unknown';

function padString(str, length) {
  return `${str}${' '.repeat(length - str.length)}`;
}

function parseIdentifierParam(param) {
  return [{ name: param.name, type: DEFAULT_PARAM_TYPE }];
}

function parseDefaultParam(param) {
  return [{ name: `[${param.left.name}=${param.right.value}]`, type: DEFAULT_PARAM_TYPE }];
}

function parseDestructuredParam(param) {
  const params = [{ name: DEFAULT_PARAM_NAME, type: 'Object' }];
  const props = param.properties;
  for (let i = 0; i < props.length; ++i) {
    const prop = props[i];
    params.push({ name: `${DEFAULT_PARAM_NAME}.${prop.key.name}`, type: DEFAULT_PARAM_TYPE });
  }
  return params;
}

function makeParams(params) {
  const cleanParams = params
    .reduce((col, param) => {
      if (param.type === 'Identifier') {
        return col.concat(parseIdentifierParam(param));
      } else if (param.type === 'AssignmentPattern') {
        return col.concat(parseDefaultParam(param));
      } else if (param.type === 'ObjectPattern') {
        return col.concat(parseDestructuredParam(param));
      }
      throw new Error(`Unknown param type:\n${JSON.stringify(param, null, 2)}`);
    }, []);

  const maxNameLength = cleanParams.map(({ name }) => name.length).sort().reverse()[0];
  const maxTypeLength = cleanParams.map(({ type }) => type.length + 2).sort().reverse()[0];

  return cleanParams
    .map(({ name, type }) => {
      const paddedType = padString(`{${type}}`, maxTypeLength);
      const paddedName = padString(name, maxNameLength);
      return ` * @param ${paddedType} ${paddedName} Description`;
    });
}

function getIndent(node) {
  return (node.exported) ? node.exportedStart : node.loc.start.column;
}

function buildContent(node) {
  const params = makeParams(node.params);
  const indent = getIndent(node);
  if (params.length > 0) {
    params.push(' *');
  }
  const title = [
    '/**',
    ` * ${node.id.name} - Description`,
    ' *',
  ];
  const returns = [
    ' * @returns {type} Description',
    ' */',
  ];

  return title
    .concat(params)
    .concat(returns)
    .map((line) => ' '.repeat(indent) + line)
    .join('\n');
}

function buildResult(node) {
  const content = buildContent(node);
  const line = node.loc.start.line - 1;
  return {
    content,
    line,
  };
}

function getNode(code, lineNum) {
  const ACORN_OPTS = { locations: true, sourceType: 'module' };
  const ast = acorn.parse(code, ACORN_OPTS);
  let node = null;
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

export function comment(code, lineNum = 1) {
  const node = getNode(code, lineNum);
  if (node) {
    return buildResult(node);
  }
  return '';
}
