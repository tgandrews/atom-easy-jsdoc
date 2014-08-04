'use strict';

var commentator = require('./commentator'),
    leadingWhitespace = /^(\s+)?/; // Regex to pull out any leading whitespaces

/**
 * getLine - Get the full line where the cursor resides
 *
 * @param  {Editor} editor The atom editor instance
 * @return {String}        The string at the current cursor line
 */
function getLine (editor) {
    editor.moveCursorToBeginningOfLine();
    editor.selectToEndOfLine();
    return editor.getSelectedText();
}


/**
 * functionComment - description
 *
 * @param  {type} argA description
 * @param  {type} argB description
 * @param  {type} argC description
 * @return {type}      description
 */
function functionComment (argA, argB, argC) {
    return 'javadoc';
}

module.exports = {

    /**
     * activite - The basic activate hook for atom to pullin the package.
     *
     * @param  {state} The app state
     * @return undefined
     */
    activate: function (state) {
        atom.workspaceView.command('jsdoc:block', this.writeBlock);
    },

    /**
     * writeBlock - Write out a block comment based on the current cursor position. If the position
     * is right above a function declaration, write out a jsdoc style comment, otherwise write out a
     * plain old block comment.
     *
     * @return undefined
     */
    writeBlock: function () {
        var editor = atom.workspace.activePaneItem,
            initialCursorPosition = editor.getCursorBufferPosition(),
            thisLine,
            nextLine,
            indent,
            comment,
            commentLines,
            commentType;

        // Get the text on the current line and the one below it.
        thisLine = getLine(editor);
        editor.moveCursorDown();
        nextLine = getLine(editor);
        indent = nextLine.match(leadingWhitespace)[1] || thisLine.match(leadingWhitespace)[1] || '';

        // If the cursor was located on a line that wasn't entirely white space,
        // lets assume the comment is for the below line and insert the comment between the
        // current line and the line below it.
        if (thisLine.trim() !== '') {
            editor.setCursorBufferPosition(initialCursorPosition);
            editor.insertNewlineBelow();
            editor.moveCursorDown();
            nextLine = getLine(editor);
        }

        // Generate the comment off of the current and next lines
        comment = commentator.makeComment(thisLine, nextLine);
        commentLines = comment.lines;
        commentType = comment.type;

        // Move the cursor to the beginning of where we'll start writing our comment.
        editor.setCursorBufferPosition([initialCursorPosition.row, 0]);
        editor.insertNewlineBelow();
        editor.moveCursorToBeginningOfLine();

        // Write out each of the comment lines one by one
        commentLines.forEach(function (line, index) {
            editor.insertText(indent + line);
            if (index !== commentLines.length - 1) {
                editor.insertNewlineBelow();
                editor.moveCursorToBeginningOfLine();
            }
        });

        // If the comment is an empty comment, just move it to the first line in the comment so the user
        // can just start typing their comment. If it's a function comment, we'll highlight the description
        // placeholder in the main section of the comment for easy editing.
        if (commentType === 'EMPTY') {
            editor.moveCursorUp();
        } else {
            editor.setCursorBufferPosition([initialCursorPosition.row + 2, 0]);
            editor.moveCursorToEndOfLine();
            editor.selectToPreviousWordBoundary();

            // We're looking for the 'description' text in the main comment body so that we can
            // highlight it for easy editing.
            while (editor.getSelectedText().match(/^\s+$/)) {
                editor.selectToPreviousWordBoundary();
            }
        }
    }

};
