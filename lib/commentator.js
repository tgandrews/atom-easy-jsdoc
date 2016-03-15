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

function buildComment(node) {
  const params = makeParams(node.params);
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
    .join('\n');
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
    return buildComment(node);
  }
  return '';
}
