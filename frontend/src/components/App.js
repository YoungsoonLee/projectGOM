import React, { Component } from "react";
import { Route, Link, withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import LazyRoute from "lazy-route";
import DevTools from "mobx-react-devtools";

import { Container } from 'semantic-ui-react'

import { TopBar } from "./header/index";
import { Login } from './auth/index';

@withRouter
@inject("store")
@observer
export default class App extends Component {
	constructor(props) {
		super(props);
		this.store = this.props.store;
	}
	componentDidMount() {
		this.authenticate();
	}
	authenticate(e) {
		if (e) e.preventDefault();
		this.store.appState.authenticate();
	}
	render() {
		/*
		const {
			authenticated,
			authenticating,
			//timeToRefresh,
			//refreshToken,
			//testval
		} = this.store.appState;
		*/

		return (
			<div>
				{/*<DevTools />*/}
				<TopBar />

				<Route
					exact
					path="/"
					render={props => (
						<LazyRoute {...props} component={import("./Home")} />
					)}
				/>
				
				<div>
					<Container text style={{ marginTop: '5em' }}>

						{/*
						<Route
							exact
							path="/login"
							component={Login}
						/>
						*/}

						<Route
							exact
							path="/login"
							render={props => (
								<LazyRoute {...props} component={import("./auth/Login.js")} />
							)}
						/>

						<Route
							exact
							path="/logout"
							render={props => (
								<LazyRoute {...props} component={import("./auth/Logout.js")} />
							)}
						/>

						<Route
							exact
							path="/email_confirm/:token"
							render={props => (
								<LazyRoute {...props} component={import("./user/EmailConfirm.js")} />
							)}
						/>

						<Route
							exact
							path="/unemail_confirm/"
							render={props => (
								<LazyRoute {...props} component={import("./user/UnEmailConfirm.js")} />
							)}
						/>

						<Route
							exact
							path="/forgot_password/"
							render={props => (
								<LazyRoute {...props} component={import("./user/ForgotPassword.js")} />
							)}
						/>
						
						<Route
							exact
							path="/reset_password/:token"
							render={props => (
								<LazyRoute {...props} component={import("./user/ResetPassword.js")} />
							)}
						/>

						<Route
							exact
							path="/payment"
							render={props => (
								<LazyRoute {...props} component={import("./billing/Payment.js")} />
							)}
						/>
					</Container>
					
					<Container>
						<Route
							exact
							path="/payment/history"
							render={props => (
								<LazyRoute {...props} component={import("./billing/PaymentHistory.js")} />
							)}
						/>

						<Route
							exact
							path="/news"
							render={props => (
								<LazyRoute {...props} component={import("./news/News.js")} />
							)}
						/>

						<Route
							exact
							path="/news/:id"
							render={props => (
								<LazyRoute {...props} component={import("./news/NewsDetail.js")} />
							)}
						/>

						<Route
							exact
							path="/profile"
							render={props => (
								<LazyRoute {...props} component={import("./user/Profile.js")} />
							)}
						/>

						<Route
							exact
							path="/test"
							render={props => (
								<LazyRoute {...props} component={import("./test/test.js")} />
							)}
						/>

						<Route
							exact
							path="/forum"
							render={props => (
								<LazyRoute {...props} component={import("./forum/Posts.js")} />
							)}
						/>
						
						{/*
						<Route
							exact
							path="/posts"
							render={props => (
								<LazyRoute {...props} component={import("./SubPage")} />
							)}
						/>
						<Route
							exact
							path="/posts/:id"
							render={props => (
								<LazyRoute {...props} component={import("./SubItem")} />
							)}
						/>
						*/}
						
					</Container>
					
				</div>
				
			</div>
		);
	}
}
