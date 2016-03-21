# jsdoc package
![travis status](https://travis-ci.org/tgandrews/atom-easy-jsdoc.svg)

Atom package for quick jsdoc comment generation.
Forked from [Atom JS Doc by Craig Offutt](https://github.com/coffutt/atom-jsdoc)

## Usage

Control-Shift-d or Control-Shift-j to add comment templates.

To add comments for any piece of code, position the cursor anywhere on the line preceding the line you wish to comment on.
```javascript
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
```

```javascript
/**
 * This is an empty comment
 */
var a = 'A';
```

## Autocontinue

Comments now are automatically continued if the user hits enter (new line event) while inside of a block (/**..etc.) or single line (//) comment.

## Beta version

A complete rewrite with tests and using an AST instead of regular expressions is enabled behind the beta flag. Please note this is a true beta and although it works on my projects your mileage may vary.

### Contribute
I'll be adding features periodically, however bug fixes, feature requests, and pull requests are all welcome.
