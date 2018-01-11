import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Redirect } from "react-router-dom";

export default function Protected(Children) {
	@inject("store")
	@observer
	class AuthenticatedComponent extends Component {
		constructor(props) {
			super(props);
			this.store = this.props.store.appState;
		}

		render() {
			const { authenticated } = this.store;

			return (
				<div className="authComponent">
					{authenticated ? <Redirect
                                        to={{
                                            pathname: "/",
                                            state: { from: this.props.location }
                                        }}
                                    />
                                    : <Children {...this.props} />
                    }
				</div>
			);
		}
	}
	return AuthenticatedComponent;
}
