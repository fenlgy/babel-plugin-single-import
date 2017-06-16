import assert from 'assert';
import APlugin from 'babel-plugin-import/lib/Plugin';
import {join} from 'path';

function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`);
}

function camel2Underline(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`);
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}

class Plugin extends APlugin {
  constructor(libraryName,
              libraryDirectory,
              style,
              camel2DashComponentName,
              camel2UnderlineComponentName,
              types,
              preDirectory,) {
    super(libraryName,
      libraryDirectory,
      style,
      camel2DashComponentName,
      camel2UnderlineComponentName,
      types)

    this.preDirectory = preDirectory || '';
  }

  importMethod(methodName, file) {
    if (!this.selectedMethods[methodName]) {
      const libraryDirectory = this.libraryDirectory;
      const style = this.style;
      const preDirectory = this.preDirectory;
      const transformedMethodName = this.camel2UnderlineComponentName  // eslint-disable-line
        ? camel2Underline(methodName)
        : this.camel2DashComponentName
          ? camel2Dash(methodName)
          : methodName;
      const path = winPath(join(preDirectory, this.libraryName, libraryDirectory, transformedMethodName));
      this.selectedMethods[methodName] = file.addImport(path, 'default');
      if (style === true) {
        file.addImport(`${path}/style`, 'style');
      } else if (style === 'css') {
        file.addImport(`${path}/style/css`, 'style');
      }
    }
    return this.selectedMethods[methodName];
  }
}


export default function ({types}) {
  let plugins = null;

  // Only for test
  global.__clearBabelAntdPlugin = () => {
    plugins = null;
  };

  function applyInstance(method, args, context) {
    for (const plugin of plugins) {
      if (plugin[method]) {
        plugin[method].apply(plugin, [...args, context]);
      }
    }
  }

  function Program(path, {opts = {}}) {
    // Init plugin instances once.
    if (!plugins) {
      if (Array.isArray(opts)) {
        plugins = opts.map(({
                              libraryName,
                              libraryDirectory,
                              style,
                              camel2DashComponentName,
                              camel2UnderlineComponentName,
                              preDirectory,
                            }) => {
          assert(libraryName, 'libraryName should be provided');
          return new Plugin(
            libraryName,
            libraryDirectory,
            style,
            camel2DashComponentName,
            camel2UnderlineComponentName,
            types,
            preDirectory,
          );
        });
      } else {
        assert(opts.libraryName, 'libraryName should be provided');
        plugins = [
          new Plugin(
            opts.libraryName,
            opts.libraryDirectory,
            opts.style,
            opts.preDirectory,
            opts.camel2DashComponentName,
            opts.camel2UnderlineComponentName,
            types
          ),
        ];
      }
    }
    applyInstance('Program', arguments, this);  // eslint-disable-line
  }

  const methods = [
    'ImportDeclaration',
    'CallExpression',
    'MemberExpression',
    'Property',
    'VariableDeclarator',
    'LogicalExpression',
    'ConditionalExpression',
    'IfStatement',
    'ExpressionStatement',
    'ReturnStatement',
    'ExportDefaultDeclaration',
  ];

  const ret = {
    visitor: {Program},
  };

  for (const method of methods) {
    ret.visitor[method] = function () { // eslint-disable-line
      applyInstance(method, arguments, ret.visitor);  // eslint-disable-line
    };
  }

  return ret;
}