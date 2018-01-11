"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  env: function env(_env) {
    var ENV = process.env.NODE_ENV;
    return ENV === _env;
  },
  type: function type(_type) {
    var TYPE = global.TYPE;
    return TYPE === _type;
  },
  script: function script(target) {
    var env = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var ENV = process.env.NODE_ENV;
    var TARGET = process.env.npm_lifecycle_event;
    if (env) return TARGET === target && ENV === env;
    return TARGET === target;
  }
};
module.exports = exports["default"];