'use babel';

import { activate } from './jsdoc';
import test from './test';

export default {
  activate() {
    test();
    activate.apply(this, arguments);
  },
};
