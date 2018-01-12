import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect } from "react-router-dom";

import { Container, Label, Button, Message, Form, Header, Icon, Grid, Input, Segment } from 'semantic-ui-react'

@inject("store")
@observer
class UnEmailConfirm extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    componentDidMount() {
        //this.store.setInitUserInfo();
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
                                UnEmail Confirm. Resend confirm email.
                        </Header>
                        <Header.Subheader>
                            Your account need to confirm email.
                        </Header.Subheader>
                        <Header.Subheader>
                            If you want to resend, input your email and click resend.
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
                                <Button color='violet' onClick={()=>this.store.resendConfirmEmail()}>Resend</Button>
                            </Form.Field>
                        </Form>

                    </Grid.Column>
                </Grid>
            </Container>
        );
    }
}


export default UnEmailConfirm;