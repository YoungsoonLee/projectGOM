import("./styles/main.scss");
import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "mobx-react";
import { AppContainer } from "react-hot-loader";
import { rehydrate, hotRehydrate } from "rfx-core";

import { isProduction } from "./utils/constants";
import App from "./components/App";
import stores from "./stores/stores";

import socket from './lib/socket';
import axios from 'axios';

window.axios = axios;
const socketURI = process.env.NODE_ENV === 'production'
                    ? 'wss://api.bitimulate.com/ws'
                    : 'ws://localhost:4000/ws'

if(process.env.NODE_ENV === 'production') {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'https://api.bitimulate.com';
}

const store = rehydrate();

console.log(socketURI);
var wsStore = isProduction ? store : hotRehydrate();
socket.initialize(wsStore, socketURI);
window.socket = socket;

const renderApp = Component => {
	render(
		<AppContainer>
			<Router>
				<Provider store={isProduction ? store : hotRehydrate()}>
					<App />
				</Provider>
			</Router>
		</AppContainer>,
		document.getElementById("root")
	);
};

renderApp(App);

if (module.hot) {
	module.hot.accept(() => renderApp(App));
}
