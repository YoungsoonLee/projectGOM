import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Dimmer, Loader, Segment } from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class EmailConfirm extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    componentDidMount() {
        const { history } = this.props;
        this.store.emailConfirm(this.props.match.params.token, history);
    }

    render() {
        return (
            <Loader active inline='centered' />
        );
    }
}

export default EmailConfirm;