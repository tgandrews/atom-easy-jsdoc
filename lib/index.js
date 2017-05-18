'use babel';
/* global atom */

import { comment } from './jsdocer';
import { parse } from './commentContinuer';

const BETA_KEY = 'atom-easy-jsdoc.beta';
const USE_RETURNS_KEY = 'atom-easy-jsdoc.useReturns';

const regexJsDoc = require('./regex/jsdoc');

/**
 * createComment - Create and insert a JS Doc comment for the comment next to
 * the cursor.
 *
 * @returns {void}
 */
function createComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const code = editor.getText();
  const { row } = editor.getCursorBufferPosition();
  const lineNum = row + 1;
  const { content, line } = comment(code, lineNum, atom.config.get(USE_RETURNS_KEY));
  if (content && line) {
    editor.setCursorBufferPosition([(line - 1), 0]);
    editor.insertText(`\n${content}`);
  }
}

/**
 * continueComment - Continue comments when entering a new line.
 *
 * @returns {void}
 */
function continueComment() {
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return;
  }
  const { row } = editor.getCursorBufferPosition();
  const previousLine = editor.lineTextForBufferRow(row - 1);
  const nextLine = parse(previousLine);
  if (nextLine.length > 0) {
    editor.insertText(nextLine);
  }
}

/**
 * activate - Attach the event listeners.
 *
 * @returns {void}
 */
export function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': () => {
      if (atom.config.get(BETA_KEY)) {
        createComment();
      } else {
        regexJsDoc.block(atom.config.get(USE_RETURNS_KEY));
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

const betaDescription = [
  'This is a complete rewrite and uses an abstract syntax tree instead of regular expressions.',
  'It adds support for ES 2015 function parameters and exports.',
  'More features are coming...',
];

const returnsDescription = [
  'JSDoc could not make a decision as to which to use, @return or @returns so allow both.',
  'Eslint valid JSDoc expects @returns so you can enable this here.',
  'This will default to true after version 5.',
];

export const config = {
  useReturns: {
    type: 'boolean',
    default: false,
    title: 'Use @returns instead of @return',
    description: returnsDescription.join(' '),
  },
  beta: {
    type: 'boolean',
    default: false,
    title: 'Enable Beta',
    description: betaDescription.join(' '),
  },
};
