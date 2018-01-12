import React, { Component } from 'react';
import { Button, Icon } from 'semantic-ui-react'
import { Link, withRouter } from "react-router-dom";

import { observer, inject } from 'mobx-react';

@withRouter
@inject("store")
@observer
class Social extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    handleSocialAuth = (provider) => {
        console.log(provider);
    }

    render() {
        const { history } = this.props;
        const { lastLocation } = this.props;
        const { authModalMode, signupStep, userInfo, error } = this.store;
        
        return (
            <div>
                <Button size='small' color='facebook' onClick={()=>this.store.socialAuth('facebook', history, lastLocation)}>
                    <Icon name='facebook' /> Facebook
                </Button>
                <Button size='small' color='google plus' onClick={()=>this.store.socialAuth('google', history, lastLocation)}>
                    <Icon name='google plus' /> Google Plus
                </Button>
            </div>
        );
    }
}



export default Social;