import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Dimmer, Loader, Segment, Card, Icon, Button, Image, Message } from 'semantic-ui-react'

//import Protected from "../wrapper/Protected";
import ChargeDataWrapper from '../wrapper/ChargeDataWrapper';
import Script from 'react-load-script'

//@Protected
@ChargeDataWrapper
@withRouter
@inject("store")
@observer
class Payment extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    render() {
        const { history } = this.props;
        const { chagrgeItems, errorFlash, successFlash } = this.store.billingState;
        const { loggedInUserInfo } = this.store.appState;

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
                {successFlashView}
                {errorFlashView}
                <Card.Group itemsPerRow={3} >
                    {chagrgeItems.slice(0, chagrgeItems.length).map(item => 
                        <Card key={item.item_id} >
                            <Card.Content>
                                <Image floated='right' size='mini' src='/assets/images/diamond.png' />
                                <Card.Header>
                                    {item.item_name}
                                </Card.Header>
                                <Card.Meta>
                                    <Icon name='dollar'/>{item.price}
                                </Card.Meta>
                                <Card.Description>
                                    <strong>{item.amopunt}</strong>
                                    {item.item_description}
                                </Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <div className='ui two buttons'>
                                    <Button basic color='green' onClick={() => this.store.billingState.openPay(loggedInUserInfo._id, item.item_id, history)}>BUY</Button>
                                </div>
                            </Card.Content>
                        </Card>
                    )} 
                </Card.Group>

                <button data-xpaystation-widget-open id="buyXsolla" hidden="hidden">Buy Credits</button>
                <Script url="https://static.xsolla.com/embed/paystation/1.0.7/widget.min.js"/>
            </Container>
        );
    }
}


export default Payment;