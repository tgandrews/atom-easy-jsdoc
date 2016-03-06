'use babel';

import * as acorn from 'acorn';

export function comment(code) {
  const ast = acorn.parse(code);
  const children = ast.body;
  const comments = children
    .filter((child) => child.type === 'FunctionDeclaration')
    .map((child) => ['/**',
        `* ${child.id.name} - Description`,
        '*',
        '* @returns {type} Description',
        '**/'].join('\n')
    );
  return comments[0];
}
