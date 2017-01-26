'use strict';

// Regex to pull out a function name and all of it's argument variable names.
var FN_ARGS = /function\s(\w+)?[\s+]?[^\(]*\(\s*([^\)]*)\)/m;
var PROTOTYPE_ARGS = /(\w+.prototype.\w+)\s*=\s*function\s{0,1}\(\s*([^\)]*)\)/m;
var OBJECT_ARGS = /(\w+)\s*:\s*function\s{0,1}\(\s*([^\)]*)\)/m;
var METHOD_ARGS = /(\w+[\s]?\w+)[\s+]?[^\(]*\(\s*([^\)]*)\)[\s]?\{/m;

/**
 * buildCommentString - Build out a jsdoc style function comment from the provided inputs.
 *
 * @param   {Array}  fnArgs  - Array of function argument strings.
 * @param   {string} fnName  - The name of the function if non-anonymous
 * @returns {Array}            The jsdoc style comment in a line by line array.
 */
function buildCommentString (fnArgs, fnName, useReturns) {
    if (!fnName) {
        fnName = 'anonymous function';
    }

    if (!fnArgs) {
        fnArgs = [];
    }

    var comment = [],
        startLine = ' * ',
        longestArgLength = fnArgs.reduce(function (prevLength, current, index) {
            current = fnArgs[index] = current.trim();
            return prevLength > current.length ? prevLength : current.length;
        }, 0),
        returnKey = useReturns ? 'returns' : 'return';

    comment.push('/**');

    // If a method modifier is present -> prepend an `@` symbol to `fnName`
    if (fnName.indexOf('static') > -1) {
      comment.push(startLine + '@' + fnName + ' - description');
    } else {
      comment.push(startLine + fnName + ' - description');
    }

    comment.push(startLine);

    fnArgs.forEach(function (arg) {
        var spaces = longestArgLength - arg.length + 1;
        if (arg && arg != '') {
            comment.push(startLine + '@param  {type} ' + arg + new Array(spaces).join(' ') + ' description');
        }
    });

    comment.push(startLine + '@' + returnKey + ' {type} ' + new Array(longestArgLength+1).join(' ') + ' description');
    comment.push(' */');

    return comment;
}

/**
 * parseFunctionDeclaration - Parses a function declaration into its parts.
 * Returns an array with the function name (if non-anonymous) as the
 * second argument and then a comma separated string of all argument variable names.
 *
 * @param   {string} line - The line we wish to parse
 * @returns {Array}         The result of the regex match or undefined if there is no match.
 */
function parseFunctionDeclaration (line) {
    return line.match(FN_ARGS) || line.match(PROTOTYPE_ARGS) || line.match(OBJECT_ARGS) || line.match(METHOD_ARGS);
}

/**
 * emptyCommentBlock - Buids an empty (non-function) comment block.
 *
 * @returns {Array} An array of commnet character strings
 */
function emptyCommentBlock () {
    return ['/**', ' * ', ' */'];
}

module.exports = {

    /**
     * makeComment - Takes two arguments, current line (the line the user is typing on)
     * and the next line in the file (the line the comment is assumed to be for). If the
     * first line is a comment line, we know that we want to continue, otherwise return undefined.
     * If the next line is a function, we parse it and assemble comments for it. IF it's
     * not a function, we just insert an empty block comment and move on.
     *
     * @param   {string} currentLine  - The current line the user is typing on.
     * @param   {string} nextLine     - The line immediately following the current line.
     * @returns {Object}                An object with a comment type field (FUNCTION or EMPTY) enum and an array of comment line strings.
     */
    makeComment: function (currentLine, nextLine, useReturns) {
        var declaration = parseFunctionDeclaration(nextLine);

        // If the next line is a declaration, lets handle it and if not just return a plain old comment.
        if (declaration) {
            return {
                lines: buildCommentString(declaration[2].split(','), declaration[1], useReturns),
                type: 'FUNCTION'
            };
        }
        return {
            lines: emptyCommentBlock(),
            type: 'EMPTY'
        };
    }

};
