import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Carousel from './ui/Carousel';

import { Message, Container, Grid } from 'semantic-ui-react'

@inject("store")
@observer
export default class Home extends Component {
	constructor(props) {
		super(props);
		this.store = this.props.store;
	}

	render() {
		const store = this.store;

        // TODO: next 쿼리 체크
        const { authModalMode, signupStep, userInfo, error, errorFlash, successFlash } = this.store.appState;

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
			<Container style={{ marginTop: '5em' }}>
				{/* <div><Carousel /></div> */}
				{successFlashView}
				{errorFlashView}

				<Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
					<Grid.Column style={{ marginTop: '10em'  }}>
						<h1>projectGOM</h1>
					</Grid.Column>
				</Grid>
				
				<div className="page home" >
					<main>
						<div className="section-header">
							<h3>Included libraries</h3>
							<hr />
						</div>
						<div className="boilerplate-item">
							<div className="boilerplate-logo react" />
							<div className="boilerplate-item-content">
								<a
									href="https://facebook.github.io/react/"
									target="_blank"
								>
									<h4>React</h4>
								</a>
								<small>UI Library</small>
								<p>
									React makes it painless to create
									{" "}
									<br />
									interactive UIs.
								</p>
							</div>
						</div>
						<div className="boilerplate-item">
							<div className="boilerplate-logo mobx" />
							<div className="boilerplate-item-content">
								<a
									href="http://mobxjs.github.io/mobx/"
									target="_blank"
								>
									<h4>MobX</h4>
								</a>
								<small>Reactive State Management</small>
								<p>
									MobX is a battle tested library that makes state management simple and scalable.
								</p>
							</div>
						</div>
						<div className="boilerplate-item">
							<div className="boilerplate-logo reactrouter" />
							<div className="boilerplate-item-content">
								<a
									href="https://react-router.now.sh/"
									target="_blank"
								>
									<h4>React Router 4</h4>
								</a>
								<small>Routing Library</small>
								<p>
									React Router is a declarative way to render, at any location, any UI that you and your team can think up.
								</p>
							</div>
						</div>
						<div className="boilerplate-item">
							<div className="boilerplate-logo webpack" />
							<div className="boilerplate-item-content">
								<a href="http://webpack.github.io/" target="_blank">
									<h4>Webpack 2</h4>
								</a>
								<small>Module Bundler</small>
								<p>
									Webpack takes modules with dependencies and generates static assets representing those modules.
								</p>
							</div>
						</div>
						<div className="section-header extras">
							<h4>Extras</h4>
							<hr />
							<ul>
								<li>✓ Async Component Loading</li>
								<li>✓ Code-splitting</li>
								<li>✓ Extracted and autoprefixed CSS</li>
							</ul>
						</div>
					</main>
				</div>

			</Container>
		);
	}
}
