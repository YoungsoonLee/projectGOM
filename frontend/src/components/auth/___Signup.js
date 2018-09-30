import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect,Link, withRouter  } from "react-router-dom";

import { Container, Button, Header, Modal, Message, Grid, Form, Segment, Input, Divider, Label, Icon } from 'semantic-ui-react'
import validator from 'validator';

//import ActiveLink from "../ui/ActiveLink";
import Social from './Social';
import AlreadyLogin from '../wrapper/AlreadyLoginWrapper';

import { withLastLocation } from 'react-router-last-location';

@AlreadyLogin
@withRouter
@inject("store")
@observer
class Signup extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store;
        this.store.appState.setInitUserInfo(); // clear flash message
    }
    /*
    componentDidMount() {
        this.store = this.props.store.appState;
        this.store.setInitUserInfo(); // clear flash message
        console.log('componentDidMount');
    }
    
    componentDidUpdate(){
        console.log('componentDidUpdate');
    }
    */
    handleSignup = (e) => {
        if (e) e.preventDefault();
        const { history, lastLocation } = this.props;
        const { userInfo, setError, localRegister, error } = this.store;
        localRegister(history, lastLocation)
    }

    handleModeChanged = (e) =>{
        //this.store.changeAuthModalMode();
        this.store.setInitUserInfo();
        const { history } = this.props;
        history.push('/login');
    }

    /*
    hanleModeInit = (e) => {
        this.store.setInitModal();
    }
    */

    handleInputEmail = (e, { value }) => {
        this.store.userInfo.email = value;
    }

    handleInputPassword = (e, { value }) => {
        this.store.userInfo.password = value;
    }

    handleInputDisplayName = (e, { value }) => {
        this.store.userInfo.displayname = value;
    }

    /*
    handleForgotPassword = (e) =>{
        this.store.setInitUserInfo();
        const { history } = this.props;
        history.push('/forgot_password');
    }
    */

    // login or register component
	render() {
        const { history } = this.props;
        const { lastLocation } = this.props;
        const { userInfo, error, errorFlash, successFlash } = this.store.appState;

        const ErrorView = (
            <Label basic color='red' size='small' style={{border:0}}>{error}</Label>
        );
        
        var successFlashView = null;
        if(successFlash) {
            successFlashView = (
                <Message success visible size='tiny'>{successFlash}</Message>
            );
        }

        var errorFlashView = null;
        if(errorFlash) {
            errorFlashView = (
                <Message error visible size='tiny'>{errorFlash}</Message>
            );
        }

        const SignupView = (
            <Form size='large'>
                <Segment>
                    <Form.Field>
                        <Input 
                            icon='user' 
                            iconPosition='left' 
                            placeholder='Display name.(Nick name)' 
                            name='displayname'
                            value={userInfo.displayname} 
                            onChange={this.handleInputDisplayName}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input 
                            icon='mail' 
                            iconPosition='left'
                            placeholder='E-mail address' 
                            name='email' 
                            value={userInfo.email} 
                            onChange={this.handleInputEmail}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input 
                            icon='lock' 
                            iconPosition='left' 
                            placeholder='Password' 
                            type='password' 
                            name='Password'
                            value={userInfo.password} 
                            onChange={this.handleInputPassword}
                        />
                    </Form.Field>
                    <Form.Field>
                        <div>
                            { error !== null ? ErrorView : null }
                        </div>
                    </Form.Field>
                    <div>
                        <Button color='violet' fluid size='small' onClick={()=>this.store.localRegister(history, lastLocation)}>SIGN UP</Button>
                    </div>
                    <Divider horizontal>Or</Divider>
                    <Social lastLocation={lastLocation}/>
                </Segment>
            </Form>
        );

        const ModalView = (
            <Container text style={{ marginTop: '5em' }}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450 }}>
                        {successFlashView}
                        {errorFlashView}
                        
                        <Header as='h2' textAlign='center'>SIGN UP</Header>

                        { SignupView }

                        <Message>
                            Already join us?  <a style={{ cursor: 'pointer' }} onClick={this.handleModeChanged}>SIGN IN</a>
                        </Message>

                    </Grid.Column>
                </Grid>
            </Container>
        );

		return (ModalView);
	}
}

export default withLastLocation(Signup);