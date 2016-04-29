function padString(str, length) {
  const spacer = ' ';
  const padding = spacer.repeat(length - str.length);
  return `${str}${padding}`;
}

function renderParam(nameLength, typeLength, { name, type }) {
  const paddedName = padString(name, nameLength);
  const paddedType = padString(`${type}`, typeLength);
  return ` * @param ${paddedType} ${paddedName} Description`;
}

function sortNum(a, b) {
  return a - b;
}

function maxPropertyLength(arr, propName) {
  return arr
    .map(obj => (obj[propName] || '').length)
    .sort(sortNum)
    .reverse()[0];
}

function jsdocifyParams(params) {
  return params.map(({ type = 'type', name, defaultValue }) => {
    let tidiedName = name;
    if (defaultValue) {
      tidiedName = `[${name}=${defaultValue}]`;
    }

    return {
      type: `{${type}}`,
      name: tidiedName,
    };
  });
}

function renderParams(funcParams) {
  const jsdocParams = jsdocifyParams(funcParams);

  const maxNameLength = maxPropertyLength(jsdocParams, 'name');
  const maxTypeLength = maxPropertyLength(jsdocParams, 'type');

  return jsdocParams.map(renderParam.bind(null, maxNameLength, maxTypeLength));
}

export function render({ name, params = [] }) {
  const open = '/**';
  const spacer = ' *';
  const nameLine = ` * ${name} - Description`;
  const returnLine = ' * @return {type} Description';
  const close = ' */';

  const header = [open, nameLine, spacer];
  const footer = [returnLine, close];

  const renderedParams = renderParams(params);
  if (renderedParams.length > 0) {
    renderedParams.push(spacer);
  }

  return header.concat(renderedParams).concat(footer).join('\n');
}
