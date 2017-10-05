'use strict';

var commentator = require('./commentator'),
    leadingWhitespace = /^(\s+)?/, // Regex to pull out any leading whitespaces
    firstBlockComment = /^\s+\/\*[^\/]/, // Matches zero to many white spaces followed by /*, not followed by /
    blockComment = /^\s+\*[^\/]/, // Matches zero to many white spaces followed by *, not followed by /
    lineComment = /^((\s+\/\/)|(\/\/))/;


/**
 * isEditor - Returns whether the editor is an atom editor
 *
 * @param  {any} editor Possible editor
 * @return {boolean}
 */
function isEditor(editor) {
  return editor && typeof editor.getCursorBufferPosition === 'function';
}

/**
 * getLine - Get the full line where the cursor resides
 *
 * @param  {Object} editor - The atom editor instance
 * @return {string}          The string at the current cursor line
 */
function getLine (editor) {
    editor.moveToBeginningOfLine();
    editor.selectToEndOfLine();
    return editor.getSelectedText();
}

/**
 * continueComments - output the correct comment character when continuing a comment dependent
 * upon the previous line and current cursor position.
 *
 * @param  {Object} editor - The atom editor instance
 * @return undefined
 */
function continueComments (editor) {
    var currentPosition = editor.getCursorBufferPosition(),
        previousLineText = editor.lineTextForBufferRow(currentPosition.row - 1),
        moveColumns = 0;

    if (!previousLineText) {
      return;
    }

    // If the previous line is a comment, let's assume we want to continue commenting.
    if (previousLineText.match(firstBlockComment)) {
        // setTimeout delegates insertion to after the editor has actually
        // moved the cursor to the next line
        editor.insertText(' * ');
        moveColumns = 3;
    } else if (previousLineText.match(blockComment)) {
        editor.insertText('* ');
        moveColumns = 2;
    } else if (previousLineText.match(lineComment)) {
        editor.insertText('// ');
        moveColumns = 3;
    }
}

/**
 * writeBlock - Write out a block comment based on the current cursor position. If the position
 * is right above a function declaration, write out a jsdoc style comment, otherwise write out a
 * plain old block comment.
 *
 * @return undefined
 */
function writeBlock (useReturns) {
    var editor = atom.workspace.getActivePaneItem();
    if (!isEditor(editor)) {
      return;
    }

    var initialCursorPosition = editor.getCursorBufferPosition(),
        commentStart = initialCursorPosition.row + 1,
        commentEnd,
        thisLine,
        nextLine,
        indent,
        comment,
        commentLines,
        commentType;

    // Get the text on the current line and the one below it.
    thisLine = getLine(editor);
    editor.moveDown();
    nextLine = getLine(editor);
    indent = nextLine.match(leadingWhitespace)[1] || thisLine.match(leadingWhitespace)[1] || '';

    // If the cursor was located on a line that wasn't entirely white space,
    // let's assume the comment is for the below line and insert the comment between the
    // current line and the line below it.
    if (thisLine.trim() !== '') {
        editor.setCursorBufferPosition(initialCursorPosition);
        editor.insertNewlineBelow();
        editor.moveDown();
        nextLine = getLine(editor);
    }

    // Generate the comment off of the current and next lines
    comment = commentator.makeComment(thisLine, nextLine, useReturns);
    commentLines = comment.lines;
    commentType = comment.type;

    // Move the cursor to the beginning of where we'll start writing our comment.
    editor.setCursorBufferPosition([initialCursorPosition.row, 0]);
    editor.insertNewlineBelow();
    editor.moveToBeginningOfLine();

    // Write out each of the comment lines one by one
    commentLines.forEach(function (line, index) {
        editor.insertText(indent + line);
        if (index !== commentLines.length - 1) {
            editor.insertNewlineBelow();
            editor.moveToBeginningOfLine();
        }
    });

    commentEnd = editor.getCursorBufferPosition().row;

    // If the comment is an empty comment, just move it to the first line in the comment so the user
    // can just start typing their comment. If it's a function comment, we'll highlight the description
    // placeholder in the main section of the comment for easy editing.
    if (commentType === 'EMPTY') {
        editor.moveUp();
    } else {
        editor.setCursorBufferPosition([initialCursorPosition.row + 2, 0]);
        editor.moveToEndOfLine();
        editor.selectToPreviousWordBoundary();

        // We're looking for the 'description' text in the main comment body so that we can
        // highlight it for easy editing.
        while (editor.getSelectedText().match(/^\s+$/)) {
            editor.selectToPreviousWordBoundary();
        }
    }
}

module.exports = {
    block: writeBlock,
    newline: function(event) {
        var editor = atom.workspace.getActiveTextEditor();
        if (!isEditor(editor)) {
          return;
        }
        continueComments(editor);
    }
};
