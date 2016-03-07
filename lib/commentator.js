'use babel';

import * as acorn from 'acorn';

function makeParams(params) {
  return params
    .map((param) => `* @param ${param.name} {type} Description`);
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

export function comment(code) {
  const ast = acorn.parse(code);
  const children = ast.body;
  const comments = children
    .filter((child) => child.type === 'FunctionDeclaration')
    .map(buildComment);
  return comments[0];
}
