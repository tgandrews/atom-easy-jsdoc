'use babel';
/* global atom */

import { comment } from './commentator';

function createComment() {
  const editor = atom.workspace.getActiveTextEditor();
  const contents = editor.getText();
  const jsdoc = comment(contents);
  editor.insertText(jsdoc);
}

export function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': createComment,
  });
}
