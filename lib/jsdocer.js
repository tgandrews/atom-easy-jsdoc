'use babel';

import * as acorn from 'acorn';
import * as walker from 'acorn/dist/walk';

function padString(str, length) {
  return `${str}${' '.repeat(length - str.length)}`;
}

function makeParams(params) {
  const paramNames = params
    .map((param) => {
      if (param.type === 'Identifier') {
        return param.name;
      } else if (param.type === 'AssignmentPattern') {
        return `[${param.left.name}=${param.right.value}]`;
      }
      throw new Error(`Unkown param type: ${param.type}`);
    });

  const maxParamLength = paramNames.map((p) => p.length).sort().reverse()[0];

  return paramNames
    .map((name) => ` * @param {type} ${padString(name, maxParamLength)} Description`);
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
