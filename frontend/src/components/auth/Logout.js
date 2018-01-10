import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Redirect, withRouter } from "react-router-dom";


@withRouter
@inject("store")
@observer
class Logout extends Component {
    
    constructor(props){
        super(props);
        console.log('0');
        const { history } = this.props;
        this.props.store.appState.logout(history);
    }

    componentWillMount(){
        console.log('1');
        const { history } = this.props;
        this.props.store.appState.logout(history);
        //this.store.authenticate();
    }

    componentDidMount() {
        console.log('2');
        const { history } = this.props;
        this.props.store.appState.logout(history);
        //this.store.authenticate();
    }


    render() {
        return (
            <div className="page posts">
				<ul>Logout...</ul>
			</div>
        );
    }
}

export default Logout;