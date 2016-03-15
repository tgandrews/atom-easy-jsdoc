'use babel';
/* global atom */

import { comment } from './commentator';

function createComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const contents = editor.getText();
  const { row } = editor.getCursorBufferPosition();
  const lineNum = row + 1;
  const jsdoc = comment(contents, lineNum);
  editor.insertText(jsdoc);
}

export function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': createComment,
  });
}
