import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect, withRouter } from "react-router-dom";

import { Button } from 'semantic-ui-react';

@withRouter
@inject("store")
@observer
class Logout extends Component {
    
    constructor(props) {
        super(props);
        this.store = this.props.store.appState;
    }

    componentDidMount() {
        console.log('2');
        const { history } = this.props;
        this.store.logout(history);
    }


    render() {
        const { history } = this.props;

        return (
            <div className="page posts">
                <ul>Logout...</ul>
			</div>
        );
    }
}

export default Logout;