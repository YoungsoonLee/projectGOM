import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect, withRouter } from "react-router-dom";

import { Button, Loader, Grid,Dimmer, Segment } from 'semantic-ui-react';

@withRouter
@inject("store")
@observer
export default class NotFound extends Component {
	render() {
		return (
			<div>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450, marginTop: '10em'  }}>
                        <h1>404</h1>
                    </Grid.Column>
                </Grid>
            </div>
		);
	}
}
