'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggle = toggle;

var _mobx = require('mobx');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function toggle() {
  var fnName = (arguments.length <= 0 ? undefined : arguments[0]) || 'active';
  var propKey = (arguments.length <= 1 ? undefined : arguments[1]) || 'isActive';
  return (0, _mobx.action)(function (target) {
    var _Object$assign4;

    Object.assign(target.prototype, (_Object$assign4 = {}, _defineProperty(_Object$assign4, propKey, target.prototype[propKey]), _defineProperty(_Object$assign4, fnName, (0, _mobx.action)(function () {
      var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (flag === true) return Object.assign(target.prototype, _defineProperty({}, propKey, true));
      if (flag === false) return Object.assign(target.prototype, _defineProperty({}, propKey, false));
      return Object.assign(target.prototype, _defineProperty({}, propKey, !target.prototype[propKey]));
    })), _Object$assign4));
  });
}