import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect, withRouter } from "react-router-dom";

import { Button, Loader, Grid,Dimmer, Segment } from 'semantic-ui-react';

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
            <div>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450, marginTop: '10em'  }}>
                            <Dimmer active inverted>
                                <Loader inverted>Logout...</Loader>
                            </Dimmer>

                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default Logout;