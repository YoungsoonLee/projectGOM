'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

exports.dispatch = dispatch;

var _safeAccess = require('safe-access');

var _safeAccess2 = _interopRequireDefault(_safeAccess);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getNSClassNamespace(str) {
  var lastIndex = str.lastIndexOf('.');
  return str.substring(0, lastIndex);
}

function getNSMethodName(str) {
  var lastIndex = str.lastIndexOf('.');
  return str.substring(lastIndex + 1, str.length);
}

function getRealClassName(ns, store) {
  var className = getNSClassNamespace(ns);
  var $class = (0, _safeAccess2.default)(store, className);
  if ((0, _isUndefined3.default)($class)) throw new Error('The Store ' + className + ' does not exist!');
  return $class.constructor.name;
}

function dispatch(namespace) {
  var store = _store2.default.get();
  var fn = (0, _safeAccess2.default)(store, namespace);
  var className = getRealClassName(namespace, store);
  var methodName = getNSMethodName(namespace);

  if ((0, _isFunction3.default)(fn)) {
    for (var _len = arguments.length, opt = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      opt[_key - 1] = arguments[_key];
    }

    var args = (0, _isArray3.default)(opt) ? opt : [opt];
    return (0, _safeAccess2.default)(store, [namespace, '()'].join(''), args);
  }

  throw new Error(methodName + ' is not an action of ' + className);
}