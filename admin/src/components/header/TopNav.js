import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Route, Link, withRouter } from "react-router-dom";
//import ActiveLink from "../ui/ActiveLink";

import { Menu, Container, Dropdown, Icon, Image } from 'semantic-ui-react';

//import socket from '../../lib/socket';

@withRouter
@inject("store")
@observer
class TopNav extends Component {

	state = { activeItem: 'admin' };

	constructor(props) {
		super(props);
		this.store = this.props.store.appState;
	}

	componentDidMount() {
		//socket.subscribe('BALANCE');

		//check menu
		var culoc = String(this.props.location.pathname).substring(1,String(this.props.location.pathname).length);
		
		if( culoc.length == 0){
			culoc = 'admin';
		}

		this.setState({ activeItem: culoc });
	}
	
	  
	componentWillUnmount() {
		//socket.unsubscribe('BALANCE');
	}

	handleItemClick = (e, { name }) => { 
		e.preventDefault();

		this.store.setInitUserInfo();

		this.setState({ activeItem: name });

		if (name === 'admin') {
			this.props.history.push('/');
		}else{
			this.props.history.push('/'+name);
		}
	};

	/*
	authenticate(e) {
		if (e) e.preventDefault();
		this.props.store.authenticate();
	}
	*/

	render() {
		const { authenticated, authenticating, loggedInUserInfo } = this.store;
		const { history } = this.props;

		const { activeItem } = this.state;

		var viewPane = null;

		if(authenticated) {
			viewPane = (
				<div>
					<Menu.Item>
						<Image src={loggedInUserInfo.gravatar} size='mini' circular />
						<Dropdown item text={loggedInUserInfo.displayName} size='mini' >
							<Dropdown.Menu>
								<Dropdown.Item onClick={()=>this.store.logout(history)}>Sign Out</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Menu.Item>
				</div>
			)
		}else{
			viewPane = (<div><Menu.Item name='login' active={activeItem === 'login'} onClick={this.handleItemClick}>Sign In</Menu.Item></div>)
		}
		

		return (
			<div  className="item">
				<Menu pointing borderless={true} fixed='top' >
					<Container>
						<Menu.Item name='admin' active={activeItem === 'admin'} onClick={this.handleItemClick} />
						<Menu.Item name='news' active={activeItem === 'news'} onClick={this.handleItemClick} />

						<Menu.Menu position='right'>
							{viewPane}
						</Menu.Menu>
					</Container>
				</Menu>
			</div>

		);
	}
}

export default TopNav;