'use babel';
/* global atom */

import { comment } from './jsdocer';
import { parse } from './commentContinuer';

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
    'jsdoc:block': createComment,
    'editor:newline': continueComment,
  });
}
