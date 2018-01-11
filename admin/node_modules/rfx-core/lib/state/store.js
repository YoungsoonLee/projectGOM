'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; /* eslint no-underscore-dangle: 0 */


var _mobx = require('mobx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Store = (_class = function () {
  function Store() {
    _classCallCheck(this, Store);

    this.$stores = {};
    this.$imports = {};
  }

  _createClass(Store, [{
    key: 'setup',
    value: function setup(imports) {
      this.$imports = imports;
      return this;
    }
  }, {
    key: 'inject',
    value: function inject() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.initializeStores(state);
      return this.$stores;
    }

    // alias of inject

  }, {
    key: 'init',
    value: function init() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.inject(state);
    }

    // alias of inject

  }, {
    key: 'set',
    value: function set() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.inject(state);
    }
  }, {
    key: 'get',
    value: function get() {
      return this.$stores;
    }
  }, {
    key: 'initializeStores',
    value: function initializeStores(state) {
      var _this = this;

      Object.keys(this.$imports).forEach(function (key) {
        var StoreClass = _this.$imports[key];
        var $state = state[key] || {};
        var $obj = new StoreClass($state);
        var $extend = $obj.___extend || null;
        Object.assign($obj, $state);
        _this.extendWithNestedClass($obj, $state, $extend);
        _this.$stores[key] = $obj;
        if ((0, _isFunction3.default)($obj.init)) {
          $obj.init($state);
        }
      });
    }
  }, {
    key: 'extendWithNestedClass',
    value: function extendWithNestedClass(obj, state) {
      var _this2 = this;

      var extend = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if ((0, _isUndefined3.default)(extend) || (0, _isEmpty3.default)(extend)) return;

      Object.keys(extend).forEach(function (subkey) {
        var SubClass = extend[subkey];
        var $substate = state[subkey] || {};
        var $subobj = new SubClass($substate);
        var $subextend = $subobj.___extend || null;
        Object.assign($subobj, $substate);
        Object.assign(obj, _defineProperty({}, subkey, $subobj));
        // recursion for deep nested classes
        _this2.extendWithNestedClass($subobj, $substate, $subextend);
        if ((0, _isFunction3.default)($subobj.init)) {
          $subobj.init($substate);
        }
      });
    }
  }]);

  return Store;
}(), (_applyDecoratedDescriptor(_class.prototype, 'initializeStores', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'initializeStores'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'extendWithNestedClass', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'extendWithNestedClass'), _class.prototype)), _class);
exports.default = new Store();
module.exports = exports['default'];