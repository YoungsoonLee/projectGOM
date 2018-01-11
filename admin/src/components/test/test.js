import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";


import { Image } from 'semantic-ui-react'

import ss from "../../images/mobx.png";

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
        console.log(ss);

        return (
            <div>
                Test
                <div><Image src={ss} /></div>
            </div>
        );
    }
}


export default Test;