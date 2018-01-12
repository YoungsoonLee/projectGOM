import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect } from "react-router-dom";

import { Container, Label, Button, Message, Form, Header, Icon, Grid, Input, Segment } from 'semantic-ui-react'

@inject("store")
@observer
class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }
    
    componentDidMount() {
        this.store.setInitUserInfo();
    }

    handleInputEmail = (e, { value }) => {
        this.store.userInfo.email = value;
    }


    render() {
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
                                Forgot Password
                        </Header>
                        <Header.Subheader>
                            It will send a password reset token to you.
                        </Header.Subheader>
                        <Header.Subheader>
                            Input your email and click send.
                        </Header.Subheader>

                        <Form>
                            <Form.Field></Form.Field>
                            <Form.Field>
                                <Input style={{ maxWidth: 300 }}
                                    icon='mail' 
                                    iconPosition='left'
                                    placeholder='E-mail address' 
                                    name='email' 
                                    size='small'
                                    value={userInfo.email} 
                                    onChange={this.handleInputEmail}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div>
                                    { error !== null ? ErrorView : null }
                                </div>
                            </Form.Field>
                            <Form.Field>
                                <Button color='violet' onClick={()=>this.store.forgotPassword()}>Send</Button>
                            </Form.Field>
                        </Form>

                    </Grid.Column>
                </Grid>
            </Container>
        )
    }
}

export default ForgotPassword;