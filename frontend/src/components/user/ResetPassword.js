import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Label, Button, Message, Form, Header, Icon, Grid, Input, Segment } from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    state = { confirmPassword: '' };

    componentDidMount() {
        const { history } = this.props;
        this.store.setInitUserInfo();
        this.store.isValidResetPasswordToken(this.props.match.params.token, history);
    }

    handleInputPassword = (e, { value }) => {
        this.store.userInfo.password = value;
    }

    handleInputConfirmPassword = (e, {value}) => {
        this.setState({ confirmPassword: value });
    }

    render() {
        const { history } = this.props;
        const { error, errorFlash, successFlash, userInfo } = this.store;

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

        return (
            <Container text style={{ marginTop: '5em' }}>
                <Grid>
                    <Grid.Column>
                        <div>
                            { errorFlashView }
                            { successFlashView }
                        </div>
                        <Header as='h2' icon dividing>
                                Reset Password
                        </Header>
                        <Header.Subheader>
                            Input new password
                        </Header.Subheader>

                        <Form>
                            <Form.Field></Form.Field>
                            <Form.Field>
                                <Input style={{ maxWidth: 300 }}
                                    icon='lock' 
                                    iconPosition='left'
                                    placeholder='Password' 
                                    type='password' 
                                    name='password' 
                                    size='small'
                                    value={userInfo.password} 
                                    onChange={this.handleInputPassword}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input style={{ maxWidth: 300 }}
                                    icon='lock' 
                                    iconPosition='left'
                                    placeholder='Confirm Password' 
                                    type='password' 
                                    name='confirmPassword' 
                                    size='small'
                                    value={this.state.confirmPassword} 
                                    onChange={this.handleInputConfirmPassword}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div>
                                    { error !== null ? ErrorView : null }
                                </div>
                            </Form.Field>
                            <Form.Field>
                                <Button color='violet' 
                                        onClick={
                                            ()=>this.store.resetPassword(
                                                this.props.match.params.token,
                                                this.state.confirmPassword,
                                                history
                                            )
                                        }>Save</Button>
                            </Form.Field>
                        </Form>

                    </Grid.Column>
                </Grid>
            </Container>
        );
    }
}


export default ResetPassword;