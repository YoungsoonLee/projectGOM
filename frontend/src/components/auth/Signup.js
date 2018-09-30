import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { withRouter  } from "react-router-dom";

import { Container, Button, Header, Message, Grid, Form, Segment, Input, Divider, Label } from 'semantic-ui-react'

//import ActiveLink from "../ui/ActiveLink";
import Social from './Social';
import AlreadyLogin from '../wrapper/AlreadyLoginWrapper';
import { withLastLocation } from 'react-router-last-location';

@inject("store")
@observer
export default class Signin extends Component {

    addItem(e)  {
		if (e) e.preventDefault();
        console.log("handleCreateLocalUser");
    }

    // login or register component
	render() {
        
		return (
            <Container text style={{ marginTop: '5em' }}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450 }}>
                        
                    <Form>
                    <Form.Field inline>
                        <label>First name</label>
                        <Input placeholder='First name' />
                    </Form.Field>
                    <Button type='submit' onClick={this.addItem.bind(this)}>Submit</Button>
                </Form>

                    </Grid.Column>
                </Grid>
            </Container>
        );
	}
}
