'use babel';
/* global atom */

import { comment } from './jsdocer';
import { parse } from './commentContinuer';

const BETA_KEY = 'atom-easy-jsdoc.beta';

const regexJsDoc = require('./regex/jsdoc');

function createComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const code = editor.getText();
  const { row } = editor.getCursorBufferPosition();
  const lineNum = row + 1;
  const { content, line } = comment(code, lineNum);
  editor.setCursorBufferPosition([(line - 1), 0]);
  editor.insertText(`\n${content}`);
}

function continueComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const { row } = editor.getCursorBufferPosition();
  const previousLine = editor.lineTextForBufferRow(row - 1);
  const nextLine = parse(previousLine);
  if (nextLine.length > 0) {
    editor.insertText(nextLine);
  }
}

export function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': () => {
      if (atom.config.get(BETA_KEY)) {
        createComment();
      } else {
        regexJsDoc.block();
      }
    },
    'editor:newline': () => {
      if (atom.config.get(BETA_KEY)) {
        continueComment();
      } else {
        regexJsDoc.newline();
      }
    },
  });
}

const description = [
  'This is a complete rewrite and uses an abstract syntax tree instead of regular expressions.',
  'It adds support for ES 2015 function parameters and exports.',
  'More features are coming...',
];

export const config = {
  beta: {
    type: 'boolean',
    default: false,
    title: 'Enable Beta',
    description: description.join(' '),
  },
};
