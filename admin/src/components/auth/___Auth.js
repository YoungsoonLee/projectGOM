import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Redirect } from "react-router-dom";
import ActiveLink from "../ui/ActiveLink";

import validator from 'validator';

import { Button, Header, Modal, Message, Grid, Form, Segment, Input, Divider, Label } from 'semantic-ui-react'

import Social from './Social';


//auth modal
@inject("store")
@observer
class Auth extends Component {
    constructor(props) {
		super(props);
		this.store = this.props.store.appState;
    }
    
    handleModeChanged = (e) =>{
        this.store.changeAuthModalMode();
    }

    hanleModeInit = (e) => {
        this.store.setInitModal();
    }

    handelSetSignupStep = (e, { value }) => {
        const { signupStep, userInfo } = this.store;

        //console.log(this.store.signupStep);
        //console.log(value);

        if( (signupStep == 1) && (value == 2) ){
            //check validate displayName
            if ( !(validator.isLength(userInfo.displayName, {min:3, max: 15})) || (validator.contains(userInfo.displayName, ' ')) ){
                this.store.error = 'a displayname has 3~15 letters/numbers without space.';
            }else{
                this.store.error = null;
            }
        } 

        // TODO: displayName dup check

        if(!this.store.error) {
            this.store.setSignupStep(value);
        }
        
        /*
        if (value === 1) {
            //close modal
            this.store.setSignupStep(value);
            //reopen modal? for back???
        }else{
            this.store.setSignupStep(value);
        }
        */
    }

    handleInputEmail = (e, { value }) => {
        this.store.userInfo.email = value;
    }

    handleInputPassword = (e, { value }) => {
        this.store.userInfo.password = value;
    }

    handleInputDisplayName = (e, { value }) => {
        this.store.userInfo.displayName = value;
    }

    handleSignup = (e) => {
        console.log(this.store.userInfo);
        console.log(this.authModalMode);
        //validate
    }

    handleSignin = (e) => {
        console.log(this.store.userInfo);
        console.log(this.authModalMode);
        //validate
    }

    // login or register component
	render() {
        const { authModalMode, signupStep, userInfo, error } = this.store;

        const ErrorView = (
            <Label basic color='red' pointing></Label>
        );

        const SigninView = (
            <Form size='large'>
                <Segment>
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
                    <Button color='violet' fluid size='mini' onClick={this.handleSignin}>{authModalMode === 'SIGNIN' ? 'SIGN IN' : 'SIGN UP'}</Button>
                    <Divider horizontal>Or</Divider>
                    <Social />
                </Segment>
            </Form>
        );

        const SignupStep1 = (
            <Segment>
                <Form.Field>
                    <Input 
                        icon='user' 
                        iconPosition='left' 
                        placeholder='Display name.(Nick name)' 
                        name='displayName'
                        value={userInfo.displayName} 
                        onChange={this.handleInputDisplayName}
                    />
                </Form.Field>
                
                <Form.Field>
                    <div>
                        { error !== null ? ErrorView : '' }
                    </div>
                </Form.Field>
                <Button color='violet' fluid size='mini' onClick={this.handelSetSignupStep} value='2'>NEXT</Button>
            </Segment>
        );

        const SignupStep2 = (
            <Segment>
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
                <div>
                    <Button color='violet' fluid size='mini' onClick={this.handleSignup}>SIGNUP</Button>
                </div>
                <Divider horizontal>Or</Divider>
                <Social />
            </Segment>
        );

        const SignupView = (
            <Form size='large'>
                { signupStep === 1 ? SignupStep1 : SignupStep2 }
            </Form>
        );

        const ModalView = (
            <Modal trigger={<Button basic primary onClick={this.hanleModeInit} >SIGN IN / SIGN UP</Button>} basic size={'small'} closeIcon >
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as='h2' inverted textAlign='center'>{authModalMode === 'SIGNIN' ? 'SIGN IN' : 'SIGN UP'}</Header>

                        { authModalMode === 'SIGNIN' ? SigninView : SignupView }

                        <Message>
                            {authModalMode === 'SIGNIN' ? 'New to us?' : 'already join us?'}  <a style={{ cursor: 'pointer' }} onClick={this.handleModeChanged}>{authModalMode === 'SIGNIN' ? 'SIGN UP' : 'SIGN IN'}</a>
                        </Message>

                    </Grid.Column>
                </Grid>
            </Modal>
        );

		return (ModalView);
	}
}

export default Auth;
