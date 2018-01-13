import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Menu, Icon, Container } from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class PaymentHistory extends Component {
    constructor(props) {
        super(props);
        //this.store = this.props.store.appState;

        this.appState = this.props.store.appState;
        this.billingState = this.props.store.billingState;

    }

    componentDidMount() {
        const { history } = this.props;
        this.billingState.fetchPaymentHistory(this.appState, history);
    }

    componentDidUpdate() {
        const { history } = this.props;
        this.billingState.fetchPaymentHistory(this.appState, history);
    }

    render() {
        return (
            <Container style={{ marginTop: '5em' }}>
                <div>
                    <Menu tabular>
                    {/*
                        <Menu.Item name='charge' active={this.store.historyMode === 'charge'} onClick={()=>this.store.setHistoryMode('charge')}>Charge History</Menu.Item>
                        <Menu.Item name='used' active={this.store.historyMode === 'used'} onClick={()=>this.store.setHistoryMode('used')} >Used History</Menu.Item>
                    */}
                        <Menu.Item name='charge' active={this.billingState.historyMode === 'charge'} onClick={()=>this.billingState.setHistoryMode('charge')}>Charge History</Menu.Item>
                        <Menu.Item name='used' active={this.billingState.historyMode === 'used'} onClick={()=>this.billingState.setHistoryMode('used')} >Used History</Menu.Item>
                    </Menu>
                </div>
                <div className="page home">
                    <div id="tabulator-1"></div>
                </div>
            </Container>
        );
    }
}


export default PaymentHistory;