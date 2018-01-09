import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect } from "react-router-dom";
import { Container, Button, Header, Modal, Message, Grid, Form, Segment, Input, Divider, Label } from 'semantic-ui-react'

import ActiveLink from "../ui/ActiveLink";
import Social from './Social';

@inject("store")
@observer
class Logout extends Component {
    constructor(props) {
        super(props);
        //this.store = this.props.store;
    }
    render() {
        return (
            <div className="page posts">
            <h1>Posts</h1>
				<p className="subheader">
					Posts are fetched from jsonplaceholder.typicode.com
				</p>
				<hr />
            Logout
            <Button color='violet' fluid size='small' onClick={()=>this.props.store.appState.localLogin()}>click</Button>
            </div>
        );
    }
}

export default Logout;