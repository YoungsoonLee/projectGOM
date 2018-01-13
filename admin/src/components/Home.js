import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Carousel from './ui/Carousel';

import { Button, Loader, Grid,Dimmer, Segment } from 'semantic-ui-react';


@inject("store")
@observer
export default class Home extends Component {
	constructor(props) {
		super(props);
		this.store = this.props.store;
	}

	render() {
		const store = this.store;
		return (
			<div>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                    <Grid.Column style={{ maxWidth: 450, marginTop: '10em'  }}>
                        <h1>ADMIN</h1>
                    </Grid.Column>
                </Grid>
            </div>
		);
	}
}
