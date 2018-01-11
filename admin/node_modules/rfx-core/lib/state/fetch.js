'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _after2 = require('lodash/after');

var _after3 = _interopRequireDefault(_after2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

exports.fetchData = fetchData;
exports.fetchDataOnLocationMatch = fetchDataOnLocationMatch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  Fetch data from components mapping "static fetchData()"
  and injecting store, router params and query.
  Used on the server-side. It returns a Promise.
 */
function fetchData(store, props) {
  return Promise.all(props.components.filter(function (component) {
    return component && (0, _isFunction3.default)(component.fetchData);
  }).map(function (component) {
    return component.fetchData({
      store: store,
      location: props.location,
      params: props.params,
      query: props.location.query,
      router: props.router,
      routes: props.routes
    });
  }));
}

/**
  Fetch data from components when the router matches the borwser location.
  It also prevent the first page to re-fetch data already fetched from the server.
  Used on the client-side.
 */
function fetchDataOnLocationMatch(history, routes, match, store) {
  history.listen((0, _after3.default)(1, function (route) {
    return match({ routes: routes, location: route.pathname }, function (error, redirect, props) {
      return props && fetchData(store, props);
    });
  }));
}