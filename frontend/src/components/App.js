import React, { Component } from "react";
import { Route, Link, withRouter, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
//import LazyRoute from "lazy-route";
import DevTools from "mobx-react-devtools";

import { Container } from 'semantic-ui-react'
import { LastLocationProvider } from 'react-router-last-location';

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
				<LastLocationProvider>
					<Switch>
					
						<Route exact path="/" component={Home}/>
						<Route path="/login" component={Login}/>
						<Route path="/logout" component={Logout}/>
						<Route path="/email_confirm/:token" component={EmailConfirm} />
						<Route path="/unemail_confirm/" component={UnEmailConfirm} />
						<Route path="/forgot_password/" component={ForgotPassword} />
						<Route path="/reset_password/:token" component={ResetPassword} />
						<Route path="/profile" component={Profile} />
						<Route path="/payment" component={Payment} />

						{/* maybe ... do not need contanier text*/}
						<Route path="/payment/history" component={PaymentHistory} />
						<Route path="/news" component={News} />
						<Route path="/news/:id" component={NewsDetail} />

						<Route component={NotFound}/> 
						
					</Switch>
				</LastLocationProvider>
			</div>
		);
	}
}
