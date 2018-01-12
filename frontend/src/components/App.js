import React, { Component } from "react";
import { Route, Link, withRouter, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
//import LazyRoute from "lazy-route";
import DevTools from "mobx-react-devtools";

import { Container } from 'semantic-ui-react'

//components
import NotFound from "./404";
import Home from "./Home";
import { TopBar } from "./header/index";
import { Login, Logout } from './auth/index';
import { EmailConfirm, UnEmailConfirm, ForgotPassword, ResetPassword, Profile} from './user/index';
import { Payment, PaymentHistory } from './billing/index';
import { News, NewsDetail } from './news/index';

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
				<TopBar />
				<Switch>
					<Route exact path="/" component={Home}/>
					<Route exact path="/login" component={Login}/>
					<Route exact path="/logout" component={Logout}/>
					<Route exact path="/email_confirm/:token" component={EmailConfirm} />
					<Route exact path="/unemail_confirm/" component={UnEmailConfirm} />
					<Route exact path="/forgot_password/" component={ForgotPassword} />
					<Route exact path="/reset_password/:token" component={ResetPassword} />
					<Route exact path="/profile" component={Profile} />
					<Route exact path="/payment" component={Payment} />

					{/* maybe ... do not need contanier text*/}
					<Route exact path="/payment/history" component={PaymentHistory} />
					<Route exact path="/news" component={News} />
					<Route exact path="/news/:id" component={NewsDetail} />

					<Route component={NotFound}/> 
				</Switch>
			</div>
		);
	}
}
