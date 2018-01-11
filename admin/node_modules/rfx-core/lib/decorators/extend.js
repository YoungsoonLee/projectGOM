"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
function extend() {
  var $extend = (arguments.length <= 0 ? undefined : arguments[0]) || null;
  return function (target) {
    Object.assign(target.prototype, {
      ___extend: $extend
    });
  };
}