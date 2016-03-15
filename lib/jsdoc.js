'use babel';
/* global atom */

import { comment } from './commentator';

function createComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const code = editor.getText();
  const { row } = editor.getCursorBufferPosition();
  const lineNum = row + 1;
  const { content, line } = comment(code, lineNum);
  editor.setCursorBufferPosition([(line - 1), 0]);
  editor.insertText(`\n${content}`);
}

export function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': createComment,
  });
}
