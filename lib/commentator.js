'use babel';

import * as acorn from 'acorn';

function padString(str, length) {
  return `${str}${' '.repeat(length - str.length)}`;
}

function makeParams(params) {
  const maxParamLength = params.map((p) => p.name.length).sort().reverse()[0];
  return params
    .map((param) => `* @param ${padString(param.name, maxParamLength)} {type} Description`);
}

function buildComment(node) {
  const params = makeParams(node.params);
  if (params.length > 0) {
    params.push('*');
  }
  const title = [
    '/**',
    `* ${node.id.name} - Description`,
    '*',
  ];
  const returns = [
    '* @returns {type} Description',
    '**/',
  ];

  return title
    .concat(params)
    .concat(returns)
    .join('\n');
}

export function comment(code, lineNum = 1) {
  const ACORN_OPTS = { locations: true };
  const ast = acorn.parse(code, ACORN_OPTS);
  const children = ast.body;
  const comments = children
    .filter((child) => {
      const isFunc = child.type === 'FunctionDeclaration';
      const nearCursor = child.loc.start.line === lineNum;
      return isFunc && nearCursor;
    })
    .map(buildComment);
  return comments[0];
}
