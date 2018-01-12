import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Form, Input, List, Label, Button, Message } from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class Profile extends Component {

    state = { confirmPassword: '' };

    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    componentDidMount() {
        const { history } = this.props;

        this.store.getProfile(history);
        //this.componentDidUpdate();
    }

    componentDidUpdate() {
        //sthis.store.getProfile();
    }

    handleInputPassword = (e, { value }) => {
        this.store.userInfo.password = value;
    }

    handleInputConfirmPassword = (e, {value}) => {
        this.setState({ confirmPassword: value });
    }

    render() {
        const { history } = this.props;
        const { error, errorFlash, successFlash, profileEmail, loggedInUserInfo, userInfo } = this.store;

        const ErrorView = (
            <Label basic color='red' size='small' style={{border:0}}>{error}</Label>
        );

        var successFlashView = null;
        if(successFlash) {
            successFlashView = (
                <Message success visible size='tiny' style={{ maxWidth: 450 }}>{successFlash}</Message>
            );
        }

        var errorFlashView = null;
        if(errorFlash) {
            errorFlashView = (
                <Message error visible size='tiny' style={{ maxWidth: 450 }}>{errorFlash}</Message>
            );
        }

        return (
            <Container text style={{ marginTop: '5em' }}>
                <div className="page posts">
                    <h1>Profile</h1><p color={'Red'}>* Cannot be changed</p>
                    <Form className='attached fluid segment' style={{ maxWidth: 450 }}>
                        <Form.Input color={'Grey'} label='Display Name' readOnly placeholder='Username' type='text' value={loggedInUserInfo.displayName}/>
                        <Form.Input label='Email' type='text' readOnly value={profileEmail === null ? '': profileEmail}/>
                    </Form>
                    <hr />
                    <h1>Change Password</h1>
                    { errorFlashView }
                    { successFlashView }
                    <Form className='attached fluid segment' style={{ maxWidth: 450 }}>
                        <Form.Input label='New Password' name='password' placeholder='new password' type='password' value={userInfo.password} onChange={this.handleInputPassword}/>
                        <Form.Input label='Confirm Password' name='confirmPassword' placeholder='confirm password' type='password' value={this.state.confirmPassword} onChange={this.handleInputConfirmPassword}/>
                        <div>
                            { error !== null ? ErrorView : null }
                        </div>
                        <Button color='blue' onClick={
                            ()=>this.store.updateProfile(
                                this.state.confirmPassword,
                                history
                            )
                        }>Submit</Button>
                    </Form>
                </div>
            </Container>
        );
    }
}


export default Profile;