import * as acorn from 'acorn';
import * as walker from 'acorn/dist/walk';

function getAST(code) {
  const ACORN_OPTS = { locations: true, sourceType: 'module' };
  const ast = acorn.parse(code, ACORN_OPTS);
  return ast;
}

function onLine(node, lineNum) {
  const startLine = node.loc.start.line;
  return startLine === lineNum || startLine - 1 === lineNum;
}

function getNode(ast, lineNum) {
  let node = null;
  walker.simple(ast, {
    FunctionDeclaration: (n) => {
      if (onLine(n, lineNum)) {
        node = n;
      }
    },
  });
  return node;
}

function simplifyParams(params) {
  return params.reduce((col, p) => col.concat([{ name: p.name }]), []);
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
