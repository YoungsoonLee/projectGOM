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
	
	render() {
		const { authenticated } = this.store;
		return (
			<div >
				<TopNav location={this.props.location} history={this.props.history} />
			</div>
		);
	}
}

export default TopBar;