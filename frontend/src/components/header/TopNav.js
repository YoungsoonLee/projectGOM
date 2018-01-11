import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Route, Link, withRouter } from "react-router-dom";
import ActiveLink from "../ui/ActiveLink";

import { Menu, Container, Dropdown, Icon, Image } from 'semantic-ui-react';

import socket from '../../lib/socket';

@withRouter
@inject("store")
@observer
class TopNav extends Component {

	state = { activeItem: 'home' };

	constructor(props) {
		super(props);
		this.store = this.props.store.appState;
	}

	componentDidMount() {
		socket.subscribe('BALANCE');

		//check menu
		var culoc = String(this.props.location.pathname).substring(1,String(this.props.location.pathname).length);
		
		if (  (culoc.search('payment')<0) && (culoc.search('/') > 0) ) {
			culoc = culoc.substring(0, culoc.search('/'));
		} 

		if( culoc.length == 0){
			culoc = 'home';
		}

		this.setState({ activeItem: culoc });
	}
	
	  
	componentWillUnmount() {
		socket.unsubscribe('BALANCE');
	}

	handleItemClick = (e, { name }) => { 
		e.preventDefault();

		this.store.setInitUserInfo();

		this.setState({ activeItem: name });

		if (name === 'home') {
			this.props.history.push('/');
		}else if(name ==='forum'){
			// Sets the new href (URL) for the current window.
			window.location.href = "http://localhost:4567";
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
								<Dropdown.Item name='profile' onClick={this.handleItemClick}>My Profile</Dropdown.Item>
								<Dropdown.Item name='payment/history' onClick={this.handleItemClick}>My Coin</Dropdown.Item>
								<Dropdown.Item onClick={()=>this.store.logout(history)}>Sign Out</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Menu.Item>
				</div>
			)
		}else{
			viewPane = (<div><Menu.Item name='login' active={activeItem === 'login'} onClick={this.handleItemClick}>Sign In</Menu.Item></div>)
		}

		var paymentPane = null;
		if(authenticated) {
			paymentPane = (
				<Menu.Item name='payment' active={activeItem === 'payment'} onClick={this.handleItemClick} >
					<Icon name='diamond'/>{numeral(this.store.loggedInUserInfo.balance).format('0,0')}
				</Menu.Item>
			)
		}

		return (
			<div  className="item">
				<Menu pointing borderless={true} fixed='top' >
					<Container>
						<Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
						<Menu.Item name='news' active={activeItem === 'news'} onClick={this.handleItemClick} />
						<Menu.Item name='forum' active={activeItem === 'forum'} onClick={this.handleItemClick} />

						{paymentPane}

						<Menu.Menu position='right'>
							{viewPane}
						</Menu.Menu>
					</Container>
				</Menu>
			</div>

			/*
			<nav>
				<ActiveLink activeOnlyWhenExact={true} to="/">Home</ActiveLink>
				{authenticated && <ActiveLink to="/posts">Posts</ActiveLink>}
			</nav>
			*/
		);
	}
}

export default TopNav;