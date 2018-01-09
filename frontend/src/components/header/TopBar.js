import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Menu, Container } from 'semantic-ui-react'

import TopNav from "./TopNav";
//import Button from "../ui/Button";

@withRouter
@inject("store")
@observer
class TopBar extends Component {
	
	constructor(props) {
		super(props);
		this.store = this.props.store.appState;
	}

	/*
	authenticate(e) {
		if (e) e.preventDefault();
		//console.log("CLICKED BUTTON");
		this.store.authenticate();
	}
	*/
	
	render() {
		const { authenticated } = this.store;
		return (
			<div>
				<TopNav location={this.props.location} history={this.props.history}/>
				{/*
				<Button 
					onClick={this.authenticate.bind(this)}
					title={authenticated ? "Log out" : "Sign in / Sign up"}
				/>
				*/}
			</div>
		);
	}
}

export default TopBar;