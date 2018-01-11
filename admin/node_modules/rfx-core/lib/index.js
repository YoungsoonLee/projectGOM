'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDataOnLocationMatch = exports.fetchData = exports.hotRehydrate = exports.rehydrate = exports.dehydrate = exports.dispatch = exports.store = exports.toggle = exports.extend = exports.match = undefined;

var _match = require('./match');

var _match2 = _interopRequireDefault(_match);

var _store = require('./state/store');

var _store2 = _interopRequireDefault(_store);

var _dispatcher = require('./state/dispatcher');

var _hydrate = require('./state/hydrate');

var _fetch = require('./state/fetch');

var _extend = require('./decorators/extend');

var _toggle = require('./decorators/toggle');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* decorators */


/* state */
exports.match = _match2.default;
exports.extend = _extend.extend;
exports.toggle = _toggle.toggle;
exports.store = _store2.default;
exports.dispatch = _dispatcher.dispatch;
exports.dehydrate = _hydrate.dehydrate;
exports.rehydrate = _hydrate.rehydrate;
exports.hotRehydrate = _hydrate.hotRehydrate;
exports.fetchData = _fetch.fetchData;
exports.fetchDataOnLocationMatch = _fetch.fetchDataOnLocationMatch;