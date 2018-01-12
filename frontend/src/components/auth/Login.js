import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect,Link, withRouter  } from "react-router-dom";

import { Container, Button, Header, Modal, Message, Grid, Form, Segment, Input, Divider, Label, Icon } from 'semantic-ui-react'

//import ActiveLink from "../ui/ActiveLink";
import Social from './Social';
import AlreadyLogin from '../wrapper/AlreadyLoginWrapper';

@AlreadyLogin
@withRouter
@inject("store")
@observer
class Login extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    componentDidMount() {
        console.log('componentDidMount');
    }

    componentDidUpdate(){
        console.log('componentDidUpdate');
    }
    
    handleModeChanged = (e) =>{
        this.store.changeAuthModalMode();
    }

    hanleModeInit = (e) => {
        this.store.setInitModal();
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

    handleForgotPassword = (e) =>{
        const { history } = this.props;
        history.push('/forgot_password');
    }

    // login or register component
	render() {
        const { history } = this.props;

        // TODO: next 쿼리 체크
        const { authModalMode, signupStep, userInfo, error, errorFlash, successFlash } = this.store;

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
                    <Form.Field>
                        <div>
                            { error !== null ? ErrorView : null }
                        </div>
                    </Form.Field>
                    <Button color='violet' fluid size='small' onClick={()=>this.store.localLogin(history)}>{authModalMode === 'SIGNIN' ? 'SIGN IN' : 'SIGN UP'}</Button>
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
                        { error !== null ? ErrorView : null }
                    </div>
                </Form.Field>
                <Button color='violet' fluid size='small' onClick={() => this.store.checkDisplayName() } value='2'>NEXT</Button>
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
                <Form.Field>
                    <div>
                        { error !== null ? ErrorView : null }
                    </div>
                </Form.Field>
                <div>
                    <Button color='violet' fluid size='small' onClick={() => this.store.localRegister(history)}>SIGNUP</Button>
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
            <Container text style={{ marginTop: '5em' }}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450 }}>
                        {successFlashView}
                        {errorFlashView}
                        
                        <Header as='h2' textAlign='center'>{authModalMode === 'SIGNIN' ? 'SIGN IN' : 'SIGN UP'}</Header>

                        { authModalMode === 'SIGNIN' ? SigninView : SignupView }

                        <Message>
                            <a style={{ cursor: 'pointer' }} onClick={this.handleForgotPassword}>Forgot Password?</a> {authModalMode === 'SIGNIN' ? 'New to us?' : 'already join us?'}  <a style={{ cursor: 'pointer' }} onClick={this.handleModeChanged}>{authModalMode === 'SIGNIN' ? 'SIGN UP' : 'SIGN IN'}</a>
                        </Message>

                    </Grid.Column>
                </Grid>
            </Container>
        );

		return (ModalView);
	}
}

export default Login;