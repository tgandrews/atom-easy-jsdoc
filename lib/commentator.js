'use babel';

import * as acorn from 'acorn';
import * as walker from 'acorn/dist/walk';

function padString(str, length) {
  return `${str}${' '.repeat(length - str.length)}`;
}

function makeParams(params) {
  const maxParamLength = params.map((p) => p.name.length).sort().reverse()[0];
  return params
    .map((param) => ` * @param ${padString(param.name, maxParamLength)} {type} Description`);
}

function buildContent(node) {
  const params = makeParams(node.params);
  const indent = node.loc.start.column;
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

export function comment(code, lineNum = 1) {
  const ACORN_OPTS = { locations: true };
  const ast = acorn.parse(code, ACORN_OPTS);
  let node = null;
  walker.simple(ast, {
    FunctionDeclaration: (n) => {
      const funcLine = n.loc.start.line;
      if (funcLine === lineNum || funcLine === (lineNum + 1)) {
        node = n;
      }
    },
  });
  if (node) {
    return buildResult(node);
  }
  return '';
}
