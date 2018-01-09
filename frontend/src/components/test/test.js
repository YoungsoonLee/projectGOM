import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

@withRouter
@inject("store")
@observer

class Test extends Component {
    constructor(props) {
        super(props);
        this.appStore = this.props.store.appState;
        this.billingStore = this.props.store.billingState;

        console.log(this.appStore);
        console.log(this.billingStore);

        this.billingStore.TestGetProfile(this.appStore);
    }

    componentDidMount() {
        console.log('componentDidMount: ', this.appStore.loggedInUserInfo._id);

    }

    render() {

        console.log('render: ', this.appStore.loggedInUserInfo._id);

        return (
            <div>
                Test
            </div>
        );
    }
}


export default Test;